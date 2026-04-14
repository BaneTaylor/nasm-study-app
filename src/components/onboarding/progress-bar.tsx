"use client";

const steps = ["Profile", "Learning Style", "Baseline", "Your Plan"];

export default function ProgressBar({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {steps.map((label, i) => (
        <div key={label} className="flex items-center gap-2">
          <div className="flex flex-col items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                i < currentStep
                  ? "bg-green-600 text-white"
                  : i === currentStep
                    ? "bg-blue-600 text-white"
                    : "bg-gray-800 text-gray-500"
              }`}
            >
              {i < currentStep ? "✓" : i + 1}
            </div>
            <span
              className={`text-xs mt-1 ${
                i <= currentStep ? "text-gray-300" : "text-gray-600"
              }`}
            >
              {label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              className={`w-12 h-0.5 mb-4 ${
                i < currentStep ? "bg-green-600" : "bg-gray-800"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}
