"use client";

import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
} from "recharts";

interface Props {
    data: {
        date: string;
        count: number;
    }[];
}

export default function SubmissionChart({
    data,
}: Props) {
    return (
        <ResponsiveContainer
            width="100%"
            height={300}
        >
            <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis dataKey="date" />

                <YAxis />

                <Tooltip />

                <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#2563eb"
                    strokeWidth={3}
                />
            </LineChart>
        </ResponsiveContainer>
    );
}