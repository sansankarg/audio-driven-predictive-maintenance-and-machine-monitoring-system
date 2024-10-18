import React from "react";
import { Bar } from 'react-chartjs-2';
import { BarChartData } from "../Data";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
} from "chart.js";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const Barchart = () => {
    const options = {
        responsive: true,        // Make the chart responsive
        maintainAspectRatio: false  // Disable aspect ratio maintenance
    };

    return (
        <div style={{ width: '400px', height: '300px' }}>  {/* Control the chart size */}
            <Bar options={options} data={BarChartData} />
        </div>
    );
};

export default Barchart;
