import { Panel, Group as PanelGroup, Separator as PanelResizeHandle } from 'react-resizable-panels'
import { ChatPanel } from './ChatPanel'

interface ResizableLayoutProps {
  chatOpen: boolean
  initialPrompt?: string
  claudeApiKey: string
  onCloseChat: () => void
  chatSessionId: number
  children: React.ReactNode
}

export function ResizableLayout({
  chatOpen,
  initialPrompt,
  claudeApiKey,
  onCloseChat,
  chatSessionId,
  children,
}: ResizableLayoutProps) {
  if (!chatOpen) {
    return <>{children}</>
  }

  return (
    <>
      {/* Mobile: show board normally + chat as full-screen overlay */}
      <div className="md:hidden h-full">
        {children}
      </div>
      <div className="md:hidden fixed inset-0 z-40 bg-[var(--background)]">
        <ChatPanel
          key={`mobile-${chatSessionId}`}
          claudeApiKey={claudeApiKey}
          initialPrompt={initialPrompt}
          onClose={onCloseChat}
        />
      </div>

      {/* Desktop: resizable side panel */}
      <PanelGroup orientation="horizontal" className="hidden md:flex h-full">
        <Panel defaultSize={50} minSize={30}>
          {children}
        </Panel>
        <PanelResizeHandle className="w-1 bg-[var(--foreground)] cursor-col-resize hover:bg-[var(--primary)] transition-colors" />
        <Panel defaultSize={50} minSize={30}>
          <ChatPanel
            key={chatSessionId}
            claudeApiKey={claudeApiKey}
            initialPrompt={initialPrompt}
            onClose={onCloseChat}
          />
        </Panel>
      </PanelGroup>
    </>
  )
}
