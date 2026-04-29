import { useState } from 'react'
import { APPS_SCRIPT_CODE } from '../utils/constants'
import { Button } from '@/components/ui/pixelact-ui/button'
import { Alert, AlertDescription } from '@/components/ui/pixelact-ui/alert'

interface InstructionsModalProps {
  onClose?: () => void
  dismissable: boolean
}

export function InstructionsModal({ onClose, dismissable }: InstructionsModalProps) {
  const [showScript, setShowScript] = useState(false)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white border-4 border-[var(--foreground)] shadow-[8px_8px_0_rgba(0,0,0,0.2)] max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-pixel text-[var(--foreground)]">
            Setup Instructions
          </h2>
          {dismissable && onClose && (
            <Button onClick={onClose} variant="default" size="sm">
              X
            </Button>
          )}
        </div>

        {!dismissable && (
          <div className="mb-4">
            <Alert variant="destructive" font="normal">
              <AlertDescription className="font-body text-sm">
                Required environment variables are missing. Configure them to get started.
              </AlertDescription>
            </Alert>
          </div>
        )}

        <div className="space-y-4 text-sm text-[var(--foreground)] font-body">
          <section>
            <h3 className="font-pixel text-[10px] text-[var(--foreground)] mb-2">1. Google Sheet Setup</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Ensure the first row has headers: <code className="text-xs bg-[var(--muted)] px-1 font-pixel text-[8px]">priority</code>, <code className="text-xs bg-[var(--muted)] px-1 font-pixel text-[8px]">name</code>, <code className="text-xs bg-[var(--muted)] px-1 font-pixel text-[8px]">status</code>, <code className="text-xs bg-[var(--muted)] px-1 font-pixel text-[8px]">observation</code>, <code className="text-xs bg-[var(--muted)] px-1 font-pixel text-[8px]">tags</code>, <code className="text-xs bg-[var(--muted)] px-1 font-pixel text-[8px]">can be saas</code></li>
              <li>Share the sheet: <strong>Share &rarr; Anyone with the link &rarr; Viewer</strong></li>
              <li>Copy the Sheet ID from the URL: <code className="text-xs bg-[var(--muted)] px-1 font-pixel text-[8px]">docs.google.com/spreadsheets/d/<strong>THIS_PART</strong>/edit</code></li>
            </ul>
          </section>

          <section>
            <h3 className="font-pixel text-[10px] text-[var(--foreground)] mb-2">2. Google API Key</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Go to Google Cloud Console &rarr; create or select a project</li>
              <li>Enable the <strong>Google Sheets API</strong></li>
              <li>Create an API key under <strong>Credentials</strong></li>
            </ul>
          </section>

          <section>
            <h3 className="font-pixel text-[10px] text-[var(--foreground)] mb-2">3. Configure Environment Variables</h3>

            <div className="mt-2">
              <p className="font-medium mb-1">For GitHub Pages (production):</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Go to your repo: <strong>Settings &rarr; Secrets and variables &rarr; Actions</strong></li>
                <li>Add these repository secrets:</li>
              </ul>
              <div className="mt-2 bg-[var(--muted)] border-2 border-[var(--foreground)] p-3 font-mono text-xs">
                <div>VITE_GOOGLE_API_KEY=<span className="text-[var(--muted-foreground)]">your_api_key</span></div>
                <div>VITE_GOOGLE_SHEET_ID=<span className="text-[var(--muted-foreground)]">your_sheet_id</span></div>
                <div>VITE_SHEET_TAB_NAME=<span className="text-[var(--muted-foreground)]">Sheet1</span> <span className="text-[var(--muted-foreground)]">(optional)</span></div>
                <div>VITE_APPS_SCRIPT_URL=<span className="text-[var(--muted-foreground)]">https://script.google.com/...</span> <span className="text-[var(--muted-foreground)]">(optional)</span></div>
              </div>
            </div>

            <div className="mt-3">
              <p className="font-medium mb-1">For local development:</p>
              <p>Create a <code className="text-xs bg-[var(--muted)] px-1 font-pixel text-[8px]">.env</code> file in the project root with the same variables above.</p>
            </div>
          </section>

          <section>
            <h3 className="font-pixel text-[10px] text-[var(--foreground)] mb-2">4. Apps Script (optional)</h3>
            <ul className="list-disc pl-5 space-y-1 mb-2">
              <li>In your Google Sheet: <strong>Extensions &rarr; Apps Script</strong></li>
              <li>Replace the default code with the script below</li>
              <li><strong>Deploy &rarr; New deployment &rarr; Web app</strong></li>
              <li>Execute as: <strong>Me</strong>. Who has access: <strong>Anyone</strong>.</li>
              <li>Copy the deployment URL and add it as <code className="text-xs bg-[var(--muted)] px-1 font-pixel text-[8px]">VITE_APPS_SCRIPT_URL</code></li>
            </ul>
            <Button
              onClick={() => setShowScript(!showScript)}
              variant="link"
              size="sm"
              className="text-[9px]"
            >
              {showScript ? 'Hide' : 'Show'} Apps Script code
            </Button>
            {showScript && (
              <pre className="mt-2 bg-[var(--muted)] border-2 border-[var(--foreground)] p-3 text-xs overflow-x-auto">
                <code>{APPS_SCRIPT_CODE}</code>
              </pre>
            )}
          </section>
        </div>

        <div className="mt-6 flex gap-3">
          {!dismissable && (
            <Button
              onClick={() => window.location.reload()}
              variant="success"
              className="flex-1"
            >
              Verify Configuration
            </Button>
          )}
          {dismissable && onClose && (
            <Button
              onClick={onClose}
              variant="secondary"
              className="flex-1"
            >
              Close
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
