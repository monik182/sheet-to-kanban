import { useState } from 'react'
import { APPS_SCRIPT_CODE } from '../utils/constants'

interface InstructionsModalProps {
  onClose?: () => void
  dismissable: boolean
}

export function InstructionsModal({ onClose, dismissable }: InstructionsModalProps) {
  const [showScript, setShowScript] = useState(false)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Setup Instructions
          </h2>
          {dismissable && onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl leading-none"
            >
              &times;
            </button>
          )}
        </div>

        {!dismissable && (
          <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg text-sm text-amber-800 dark:text-amber-200">
            Required environment variables are missing. Configure them to get started.
          </div>
        )}

        <div className="space-y-4 text-sm text-gray-700 dark:text-gray-300">
          <section>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">1. Google Sheet Setup</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Ensure the first row has headers: <code className="text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded">priority</code>, <code className="text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded">name</code>, <code className="text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded">status</code>, <code className="text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded">observation</code>, <code className="text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded">tags</code>, <code className="text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded">can be saas</code></li>
              <li>Share the sheet: <strong>Share &rarr; Anyone with the link &rarr; Viewer</strong></li>
              <li>Copy the Sheet ID from the URL: <code className="text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded">docs.google.com/spreadsheets/d/<strong>THIS_PART</strong>/edit</code></li>
            </ul>
          </section>

          <section>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">2. Google API Key</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Go to Google Cloud Console &rarr; create or select a project</li>
              <li>Enable the <strong>Google Sheets API</strong></li>
              <li>Create an API key under <strong>Credentials</strong></li>
            </ul>
          </section>

          <section>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">3. Configure Environment Variables</h3>

            <div className="mt-2">
              <p className="font-medium mb-1">For GitHub Pages (production):</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Go to your repo: <strong>Settings &rarr; Secrets and variables &rarr; Actions</strong></li>
                <li>Add these repository secrets:</li>
              </ul>
              <div className="mt-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-3 font-mono text-xs">
                <div>VITE_GOOGLE_API_KEY=<span className="text-gray-400">your_api_key</span></div>
                <div>VITE_GOOGLE_SHEET_ID=<span className="text-gray-400">your_sheet_id</span></div>
                <div>VITE_SHEET_TAB_NAME=<span className="text-gray-400">Sheet1</span> <span className="text-gray-400">(optional)</span></div>
                <div>VITE_APPS_SCRIPT_URL=<span className="text-gray-400">https://script.google.com/...</span> <span className="text-gray-400">(optional)</span></div>
              </div>
            </div>

            <div className="mt-3">
              <p className="font-medium mb-1">For local development:</p>
              <p>Create a <code className="text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded">.env</code> file in the project root with the same variables above.</p>
            </div>
          </section>

          <section>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">4. Apps Script (optional — enables drag-and-drop write-back)</h3>
            <ul className="list-disc pl-5 space-y-1 mb-2">
              <li>In your Google Sheet: <strong>Extensions &rarr; Apps Script</strong></li>
              <li>Replace the default code with the script below</li>
              <li><strong>Deploy &rarr; New deployment &rarr; Web app</strong></li>
              <li>Execute as: <strong>Me</strong>. Who has access: <strong>Anyone</strong>.</li>
              <li>Copy the deployment URL and add it as <code className="text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded">VITE_APPS_SCRIPT_URL</code></li>
            </ul>
            <button
              onClick={() => setShowScript(!showScript)}
              className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
            >
              {showScript ? 'Hide' : 'Show'} Apps Script code
            </button>
            {showScript && (
              <pre className="mt-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-3 text-xs overflow-x-auto">
                <code>{APPS_SCRIPT_CODE}</code>
              </pre>
            )}
          </section>
        </div>

        <div className="mt-6 flex gap-3">
          {!dismissable && (
            <button
              onClick={() => window.location.reload()}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Verify Configuration
            </button>
          )}
          {dismissable && onClose && (
            <button
              onClick={onClose}
              className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
