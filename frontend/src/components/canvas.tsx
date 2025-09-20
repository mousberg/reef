"use client"

interface CanvasProps {
  projectId: string
}

export function Canvas({ projectId }: CanvasProps) {
  return (
    <div className="flex-1 flex flex-col bg-gray-50">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-end">
          <div className="flex items-center gap-2">
            <button className="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-500">
              Export
            </button>
            <button className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50">
              Publish
            </button>
          </div>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 p-6">
        <div className="flex h-full items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-white">
          <div className="text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
              aria-hidden="true"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <h3 className="mt-2 text-sm font-semibold text-gray-900">Canvas Area</h3>
            <p className="mt-1 text-sm text-gray-500">
              This is a placeholder for the project canvas. In the future, this will display:
            </p>
            <ul className="mt-2 text-sm text-gray-500 space-y-1">
              <li>• Visual project diagrams</li>
              <li>• Code structure visualization</li>
              <li>• Interactive workflows</li>
              <li>• Real-time collaboration features</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}