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
    <PanelGroup orientation="horizontal" className="h-full">
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
  )
}
