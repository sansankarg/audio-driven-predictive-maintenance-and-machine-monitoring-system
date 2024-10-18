import eventlet
from bson import ObjectId
eventlet.monkey_patch()
from datetime import datetime
from collections import Counter
from flask import Flask, jsonify, request, session
from flask_socketio import SocketIO, emit
from flask_cors import CORS
import bcrypt
from pymongo import MongoClient
from evaluation import getPrediction
from threading import Thread,Lock
import numpy as np


app = Flask(_name_)
CORS(app, supports_credentials=True,resources={r"/*": {"origins": "http://localhost:3000"}})
socketio = SocketIO(app, cors_allowed_origins="http://localhost:3000", async_mode='eventlet')

app.secret_key = 'your_secret_key_here'
client = MongoClient('mongodb://localhost:27017/')
db = client['UserDB']
collection = db['users']

system_user="Visvesh"
consecutive_faults={}
dataForPrediction = [
]

thread = None
thread_lock = Lock()
stop_thread = False

Machinedata = [
    {"machine_name": "ohhh", "status": "Running", "health": "Good", "zone": "Zone 1"},
    {"machine_name": "yehhh", "status": "Stopped", "health": "Fair", "zone": "Zone 2"},
    {"machine_name": "Machine C", "status": "Maintenance", "health": "FAULTY", "zone": "Zone 3"},
    {"machine_name": "Machine D", "status": "Maintenance", "health": "FAULTY", "zone": "Zone 3"}
]

machine_status_data ={}  # Store batches of machine statuses
batch_size = 3  # Size of each batch
alert = {"alert": "Machine 1 has issue"}
predict = True

def update_machine_data():
    global consecutive_faults, machine_status_data
    if dataForPrediction and predict:
        set = 0
        while True:
            set=set+1
            print(f"STARTED TO COLLECT DATA FOR SET : {set}")
            Machinedata = getPrediction(dataForPrediction)  # Fetch new machine data
            print(Machinedata)
            buffer = False
            update_machine=[]
            for machine in Machinedata:
                machine_name = machine['machine_name']
                machineId=machine['machineId']
                current_status = machine['status']
                current_health = machine['health']

                # Convert the status to a binary value (Running = 1, others = 0)
                status_binary = 1 if current_status == "RUNNING" else 0
                health_binary = 1 if current_health == "HEALTHY" else 0

                # Initialize list for each machine if it doesn't exist in the dictionary
                if machine_name not in machine_status_data:
                    machine_status_data[machine_name] = {
                        'status': [],
                        'health': []
                    }

                # Add the current status to the machine's status data
                machine_status_data[machine_name]['status'].append(status_binary)
                machine_status_data[machine_name]['health'].append(health_binary)
                # When we have enough data (batch size) for the current machine, calculate the mean
                if len(machine_status_data[machine_name]['status']) == batch_size:
                    mean_status = np.mean(machine_status_data[machine_name]['status'])
                    mean_health = np.mean(machine_status_data[machine_name]['health'])
                    buffer = True
                    machine['health'] = "HEALTHY" if mean_health == 1 else "FAULTY"
                    if mean_status == 1:
                        machine['status'] = "RUNNING"
                    else:
                        machine['status'] = "NOT RUNNING"
                        machine['health'] = "------"
                    # Update the machine status based on the mean

                    update_machine.append(machine)
                    machine_status_data[machine_name] = {'status': [], 'health': []}
                # Handle fault updates as before
                if machine_name not in consecutive_faults:
                    consecutive_faults[machine_name] = 0

                current_health = machine['health']
                if current_health == "FAULTY":
                    consecutive_faults[machine_name] += 1
                    if consecutive_faults[machine_name] >= 3:
                        print(f"ALERT DATA UPDATED: {machine_name} in {machine['zone']} is FAULTY!")
                        alert['alert'] = f"ALERT: {machine_name} in {machine['zone']} is FAULTY!"

                        fault_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                        fault_id=str(ObjectId())
                        if system_user:
                            user_update_result = collection.update_one(
                                {'username': system_user},
                                {'$push': {'faults': {'fault_id':fault_id ,'machineId':machineId,'machine name': machine_name, 'fault_time': fault_time}}}
                            )
                            if user_update_result.modified_count > 0:
                                print(f"ALERT DATA UPDATED: {machine_name} in {machine['zone']} is FAULTY!")

                        consecutive_faults[machine_name] = 0
                else:
                    consecutive_faults[machine_name] = 0
            if buffer:
                print(f"DASHBOARD DATA UPDATED : {update_machine}")
                buffer = False
                if system_user:
                    data_update_result = collection.update_one(
                        {'username': system_user},
                        {'$push': {'machinedata': update_machine}}
                    )
                    if data_update_result.modified_count > 0:
                        print(f"MACHINE DATA UPDATED")
                update_machine = []
            # Emit the updated machine data to the frontend via socket
            socketio.emit("sent_data", {"machine": Machinedata})
            # print(f"Machine Data sent:{Machinedata}")

            # Sleep for 5 seconds before collecting the next batch of data
            socketio.sleep(5)

def stop_update_thread():
    global stop_thread, thread
    stop_thread = True
    if thread is not None:
        thread.join()
        thread = None

@app.route('/', methods=['GET'])
def home():
    return jsonify({'message': 'Hello Arthur'})


@app.route('/login', methods=['POST'])
def login():
    try:
        data = request.json
        email = data.get('email')
        username = data.get('username')
        password = data.get('password')
        user = collection.find_one({'email': email}) or collection.find_one({'username': username})

        if user and bcrypt.checkpw(password.encode('utf-8'), user['password']):
            session['username'] = user['username']  # Store username in session
            session['email']=user['email']
            print(f"{session.get('username')} successfully logged in")
            socketio.emit('login_status', {'message': f"{user['username']} has logged in"})

            return jsonify({'message': "Login Success", "username": user['username']})
        else:
            return jsonify({"message": "Invalid credentials"}), 401
    except Exception as e:
        return jsonify({"message": f"An error occurred: {e}"}), 500


@app.route("/signup", methods=["POST"])
def signup():
    try:
        data = request.json
        email = data.get("email")
        fullname = data.get("fullname")
        username = data.get("username")
        password = data.get("password")
        confirmpassword = data.get("confirmpassword")

        existing_user = collection.find_one({"email": email}) or collection.find_one({"username": username})
        if existing_user:
            return jsonify({"message": "Account already exists!"}), 409

        if password != confirmpassword:
            return jsonify({"message": "Passwords don't match"}), 400

        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
        new_user = {
            "email": email,
            "fullname": fullname,
            "username": username,
            "password": hashed_password,
        }

        collection.insert_one(new_user)
        return jsonify({"message": "Sign Up Successful"}), 201
    except Exception as e:
        print(f"Error during signup: {e}")
        return jsonify({"message": "An error occurred during signup"}), 500


@app.route('/faults', methods=["GET"])
def get_faults():
    try:
        username = request.args.get("username")
        print(f"{username} : {session.get('username')}")
        if username=="Visvesh":
            user = collection.find_one({'username': username})
            if user and "faults" in user:
                return jsonify({"faults": user["faults"]}), 200
            else:
                return jsonify({"faults": []}), 200

        else:
            return jsonify({"message":"Access Denied"}),403
    except Exception as e:
        return jsonify({"message": f"An error occurred: {e}"}), 500

@app.route('/faults/<fault_id>',methods=["DELETE"])
def delete_fault(fault_id):
    try:
        username=request.args.get("username")
        if username!="Visvesh":
            return jsonify({"message":"Access Denied"}),403

        result=collection.update_one(
            {"username":username},
            {"$pull":{"faults":{"fault_id":fault_id}}}
        )

        if result.modified_count>0:
            return jsonify({"message":"Fault Deleted Successfully"}),200
        else:
            return jsonify({"message":"Fault not found or Deletion failed"}),404
    except Exception as e:
        return jsonify({"message":f"An error occured: {e}"}),500

@app.route('/users',methods=["GET"])
def get_user():
    username=request.args.get('username')
    print(username)
    if not username:
        return jsonify({"message":"User not logged in"}),401

    user=collection.find_one({'username':username},{'_id':0,'password':0})
    if user:
        response = {
            "username": user.get("username"),
            "email": user.get("email"),
            "fullname": user.get("fullname")
        }
        return jsonify({"user": response}), 200

    else:
        return jsonify({"message": "User not found"}), 404


@app.route('/industry',methods=["POST"])
def get_plant():
    global thread
    data=request.get_json()

    username=data.get('username')
    plant_name=data.get('plantName')
    plant_description=data.get('plantDescription')
    zones=data.get('zones')
    dataForPrediction.clear()
    print("Previous machine data cleared.")
    print(zones)
    if zones:
        print("oooooooooo")
        print("oooooooooo")
        print("oooooooooo")
        print("oooooooooo")
        for zone in zones:
            if zone:
                zoneName = zone['zoneName']
                for machine in zone['machines']:
                    dataForPrediction.append({
                        'machineId':machine['machineId'],
                        'machineName' : machine['machineName'],
                        'micIndex' : machine['micIndex'],
                        'zoneName' : zoneName
                    })

    print(f"{username} {plant_name} {plant_description}")
    if not username or not plant_name:
        return jsonify({"message":"Missing required fields"}),400
    try:
        result=collection.update_one(
            {"username":username},
            {
                "$set":{'plantdata':{'plantname':plant_name,'plantdesciption':plant_description,'zones':zones}}
            },
            upsert=True
        )
        print("Plant recorded successfully")


        stop_update_thread()
        with thread_lock:
            if thread is None or not thread.is_alive():
                thread = socketio.start_background_task(update_machine_data)
                print("Started new thread")

        return jsonify({'message': 'Plant data saved successfully'}), 200

    except Exception as e:

        print(f"Error saving plant data: {e}")
        return jsonify({'message': 'Error saving plant data'}), 500

@app.route('/plant',methods=['GET'])
def get_plant_details():
    try:
        username=request.args.get('username')

        if username:

            user_data=collection.find_one({"username":username},{"_id":0,"plantdata":1})
            if user_data and 'plantdata' in user_data:
                return jsonify({"plantdata":user_data['plantdata']}),200
            else:
                return jsonify({"message":"No plant data found"}),404
        else:
            return jsonify({"message":"Username required"}),400

    except Exception as e:
        return jsonify({"messaage":f"An error occured {e}"}),500

@app.route('/machine-analytics/<machineId>', methods=['GET'])
def machine_analytics(machineId):
    try:
        # Check if the user is logged in and retrieve username
        username = request.args.get('username')
        time_filter=request.args.get('time_filter')
        print(username)
        print(machineId)
        machineId = int(machineId)
        if not username:
            return jsonify({"message": "User not logged in"}), 401

        # Retrieve the user's machine data from the database

        user = collection.find_one({"username": username}, {"machinedata": 1,"faults":1})
        print(f"user record: {user}")
        if not user or 'machinedata' not in user:
            print("No machine Data found")
            return jsonify({"message": "No machine data found"}), 404
        #
        machinedata = user['machinedata']
        print(f"machine data {machinedata}")
        # # Filter the data to find the specific machine by its name
        # # Change 'machine_name' to 'machineName' to match your database
        all_machine_records = [record for sublist in machinedata for record in sublist]
        machine_record = [record for record in all_machine_records if record['machineId'] == machineId]
        print(f"Filtered machine records: {machine_record}")

        if not machine_record:
            return jsonify({"message":f"Machine {machineId} not found"}),404

        total_records=len(machine_record)
        running_count=sum(1 for record in machine_record if record['status']=="RUNNING")
        not_running_count=total_records-running_count

        healthy_count = sum(1 for record in machine_record if record['health'] == "HEALTHY")
        faulty_count = sum(1 for record in machine_record if record['health'] == "FAULTY")
        nil_count=sum(1 for record in machine_record if record['health']=="------")
        if total_records > 0:
            running_percentage = (running_count / total_records) * 100
            not_running_percentage = (not_running_count / total_records) * 100
            healthy_percentage=(healthy_count/total_records)*100
            faulty_percentage=(faulty_count/total_records)*100
            nil_percentage=(nil_count/total_records)*100
        else:
            running_percentage = 0
            not_running_percentage = 0
            nil_percentage=healthy_percentage=faulty_percentage=0

        if 'faults' in user:
            faults=[fault for fault in user['faults'] if fault['machineId']==machineId]
            print(f"Faults data:{faults}")

            fault_times=[datetime.strptime(fault['fault_time'],'%Y-%m-%d %H:%M:%S')for fault in faults]

            if time_filter:
                if time_filter == 'day':
                    fault_groups = [fault_time.strftime('%Y-%m-%d') for fault_time in fault_times]
                elif time_filter == 'month':
                    fault_groups = [fault_time.strftime('%Y-%m') for fault_time in fault_times]
                elif time_filter == 'year':
                    fault_groups = [fault_time.strftime('%Y') for fault_time in fault_times]
                else:
                    return jsonify({"message": "Invalid time filter"}), 400
            else:
                return jsonify({"message": "Time filter not provided"}), 400  # Handle the absence of a time filter

            fault_counts=dict(Counter(fault_groups))
        else:
            fault_counts={}

        summary_data = {
            'machineId': machineId,
            'running_percentage': running_percentage,
            'not_running_percentage': not_running_percentage,
            'healthy_percentage':healthy_percentage,
            'faulty_percentage':faulty_percentage,
            'nil_percentage':nil_percentage,
            'fault_counts':fault_counts
        }
        print(f"Summary data {summary_data}")
        return jsonify(summary_data), 200

    except Exception as e:
        return jsonify({"message": f"An error occurred: {e}"}), 500


@socketio.on('connect')
def handle_connect():
    print('Client connected')

@socketio.on('alert')
def start_alert_generation(data):
    print("Data received: ", data)
    emit("sent_data", {"machine": Machinedata})
    print("Data sent")

@app.route('/logout',methods=['POST'])
def logout():
    try:
        return jsonify({"message":"Logout Successfully"}),200
    except Exception as e:
        return jsonify({"message":f"An error occurred:{e}"}),500

# Start the background task when the server starts
if _name_ == '_main_':
    socketio.run(app, debug=True, port=5007)