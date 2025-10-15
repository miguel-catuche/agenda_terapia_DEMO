import React from "react";

const ProgressBar = ({ label, value, total }) => {
  const porcentaje = total === 0 ? 0 : Math.round((value / total) * 100);
  const color = porcentaje >= 80 ? "from-green-400 to-blue-500" :
                porcentaje >= 50 ? "from-yellow-400 to-orange-500" :
                "from-red-400 to-pink-500";

  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm text-gray-500">{porcentaje}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-4">
        <div
          className={`h-4 rounded-full bg-gradient-to-r ${color}`}
          style={{ width: `${porcentaje}%` }}
        ></div>
      </div>
    </div>
  );
};
export default ProgressBar;