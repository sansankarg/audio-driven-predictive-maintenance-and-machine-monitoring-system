
export const LineChartData = {
  labels:[
    "Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"
  ],
  datasets: [{
    label: 'label 1',
    data: [65, 59, 80, 81, 56, 55, 40],
    fill: false,
    borderColor: 'rgb(75, 192, 192)',
    tension: 0.1
  },
  {
    label: 'label 2',
    data: [65, 40, 80, 89, 56, 90, 100],
    fill: false,
    borderColor: 'red',
    tension: 0.1
  }
]
};

export const BarChartData = {
    labels:[
      "Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"
    ],
    datasets: [{
      label: 'label 1',
      data: [65, 59, 80, 81, 56, 55, 40],
      fill: false,
      borderColor: 'rgb(75, 192, 192)',
      backgroundColor:'green',
      tension: 0.1
    },
    {
      label: 'label 2',
      data: [65, 40, 80, 89, 56, 90, 100],
      fill: false,
      borderColor: 'red',
      backgroundColor:'red',
      tension: 0.1
    }
  ]
  };

  export const PieChartData= {
    labels:[
        "Facebook","Instagram","Linkedin","Snapchat"
    ],
    datasets:[{
        label:"TimeSpent",
        data:[120,140,60,80],
        backgroundColor:[
            "blue","pink","grey","gold"
        ]
    }]
  };