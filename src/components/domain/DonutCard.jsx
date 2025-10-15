import React from "react";

const DonutCard = ({ titulo, total, data }) => {
    const colores = [
        { stroke: "stroke-blue-500", bg: "bg-blue-500" },
        { stroke: "stroke-green-500", bg: "bg-green-500" },
        { stroke: "stroke-red-500", bg: "bg-red-500" },
        { stroke: "stroke-orange-500", bg: "bg-orange-500" },
        { stroke: "stroke-purple-500", bg: "bg-purple-500" },
    ];

    const totalSum = data.reduce((acc, item) => acc + item.value, 0);

    return (
        <div className="bg-white rounded-xl shadow-sm p-4 w-full">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">{titulo}</h4>

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 w-full">
                {/* Donut visual */}
                <div className="relative w-[140px] h-[140px] flex-shrink-0">
                    <svg viewBox="0 0 36 36" className="w-full h-full">
                        {data.reduce((acc, item, i) => {
                            const porcentaje = totalSum === 0 ? 0 : (item.value / totalSum) * 100;
                            const dash = Math.round(porcentaje * 100) / 100;
                            const offset = acc.offset;
                            acc.offset += dash;
                            acc.elements.push(
                                <circle
                                    key={i}
                                    r="15.915"
                                    cx="18"
                                    cy="18"
                                    fill="transparent"
                                    strokeWidth="3"
                                    strokeDasharray={`${dash} ${100 - dash}`}
                                    strokeDashoffset={100 - offset}
                                    className={colores[i % colores.length].stroke}
                                />
                            );
                            return acc;
                        }, { offset: 0, elements: [] }).elements}
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-gray-700">
                        {total}
                    </div>
                </div>

                {/* Leyenda */}
                <div className="flex-1 flex flex-col gap-2 text-base text-gray-700">
                    {data.map((item, i) => {
                        const porcentaje = total === 0 ? 0 : Math.round((item.value / total) * 100);
                        return (
                            <div key={i} className="flex items-center gap-3">
                                <div className={`w-4 h-4 rounded-full ${colores[i % colores.length].bg}`}></div>
                                <span className="font-medium">{item.label}:</span>
                                <span>{item.value} ({porcentaje}%)</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>

    );
};


export default DonutCard