import React from "react";
import { Pie } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    Tooltip,
    Legend,
    ArcElement
} from "chart.js";

ChartJS.register(
    ArcElement,
    Tooltip,
    Legend
);

const Piechart = ({ data }) => { // Accept data as a prop
    const options = {
        responsive: true,        // Make the chart responsive
        maintainAspectRatio: false  // Disable aspect ratio maintenance
    };

    return (
        <div style={{ width: '400px', height: '300px' }}>  {/* Control the chart size */}
            <Pie options={options} data={data} />
        </div>
    );
};

export default Piechart;

