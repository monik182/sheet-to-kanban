import { Button } from '@/components/ui/pixelact-ui/button'
import { Alert, AlertDescription } from '@/components/ui/pixelact-ui/alert'

interface InstructionsModalProps {
  onClose?: () => void
  dismissable: boolean
}

export function InstructionsModal({ onClose, dismissable }: InstructionsModalProps) {
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
            </ul>
          </section>

          <section>
            <h3 className="font-pixel text-[10px] text-[var(--foreground)] mb-2">2. Deploy Cloud Functions</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Deploy the <code className="text-xs bg-[var(--muted)] px-1 font-pixel text-[8px]">getSheet</code> and <code className="text-xs bg-[var(--muted)] px-1 font-pixel text-[8px]">updateCell</code> Cloud Functions from the <code className="text-xs bg-[var(--muted)] px-1 font-pixel text-[8px]">cloud-functions/</code> directory</li>
              <li>Set the <code className="text-xs bg-[var(--muted)] px-1 font-pixel text-[8px]">APP_TOKEN</code> environment variable on the functions for authentication</li>
              <li>Note the base URL (e.g. <code className="text-xs bg-[var(--muted)] px-1 font-pixel text-[8px]">https://region-project.cloudfunctions.net</code>)</li>
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
                <div>VITE_API_URL=<span className="text-[var(--muted-foreground)]">https://region-project.cloudfunctions.net</span></div>
                <div>VITE_API_TOKEN=<span className="text-[var(--muted-foreground)]">your_secret_token</span></div>
              </div>
            </div>

            <div className="mt-3">
              <p className="font-medium mb-1">For local development:</p>
              <p>Create a <code className="text-xs bg-[var(--muted)] px-1 font-pixel text-[8px]">.env</code> file in the project root with the same variables above.</p>
            </div>
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
