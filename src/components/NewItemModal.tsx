import { useState, useEffect } from 'react'
import { DEFAULT_COLUMNS } from '../utils/constants'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/pixelact-ui/dialog'
import { Input } from '@/components/ui/pixelact-ui/input'
import { Button } from '@/components/ui/pixelact-ui/button'
import { Badge } from '@/components/ui/pixelact-ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/pixelact-ui/select'

interface ItemData {
  name: string
  priority?: string
  status?: string
  observation?: string
  tags?: string
  canBeSaas?: string
}

interface NewItemModalProps {
  open: boolean
  onClose: () => void
  onSave: (data: ItemData) => Promise<void>
  editCard?: {
    name: string
    priority: string
    status: string
    observation: string
    tags: string
    canBeSaas: string
  }
}

export function NewItemModal({ open, onClose, onSave, editCard }: NewItemModalProps) {
  const [name, setName] = useState('')
  const [priority, setPriority] = useState('')
  const [status, setStatus] = useState('To Do')
  const [observation, setObservation] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [canBeSaas, setCanBeSaas] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (editCard && open) {
      setName(editCard.name)
      setPriority(editCard.priority)
      setStatus(editCard.status || 'To Do')
      setObservation(editCard.observation)
      setTags(editCard.tags ? editCard.tags.split(',').map(t => t.trim()).filter(Boolean) : [])
      setCanBeSaas(editCard.canBeSaas)
    }
  }, [editCard, open])

  const reset = () => {
    setName('')
    setPriority('')
    setStatus('To Do')
    setObservation('')
    setTags([])
    setTagInput('')
    setCanBeSaas('')
  }

  const handleAddTag = () => {
    const trimmed = tagInput.trim()
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed])
    }
    setTagInput('')
  }

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddTag()
    }
  }

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag))
  }

  const handleSave = async () => {
    if (!name.trim()) return

    setSaving(true)
    try {
      await onSave({
        name: name.trim(),
        priority: priority || undefined,
        status,
        observation: observation || undefined,
        tags: tags.length > 0 ? tags.join(', ') : undefined,
        canBeSaas: canBeSaas || undefined,
      })
      reset()
      onClose()
    } finally {
      setSaving(false)
    }
  }

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      reset()
      onClose()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md bg-white">
        <DialogHeader>
          <DialogTitle>{editCard ? 'Edit Item' : 'New Item'}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-3 py-2">
          <div>
            <label className="text-[10px] font-pixel text-[var(--foreground)] mb-1 block">
              Name <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="Item name"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full text-xs font-body"
            />
          </div>

          <div>
            <label className="text-[10px] font-pixel text-[var(--foreground)] mb-1 block">Priority</label>
            <Select value={priority || '_none'} onValueChange={v => setPriority(v === '_none' ? '' : v)}>
              <SelectTrigger font="pixel" className="w-full text-[9px]">
                <SelectValue placeholder="No priority" />
              </SelectTrigger>
              <SelectContent font="pixel" className="text-[9px] bg-white">
                <SelectItem value="_none">No priority</SelectItem>
                {[1, 2, 3, 4, 5].map(p => (
                  <SelectItem key={p} value={String(p)}>P{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-[10px] font-pixel text-[var(--foreground)] mb-1 block">Status</label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger font="pixel" className="w-full text-[9px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent font="pixel" className="text-[9px] bg-white">
                {DEFAULT_COLUMNS.map(col => (
                  <SelectItem key={col} value={col}>{col}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-[10px] font-pixel text-[var(--foreground)] mb-1 block">Observation</label>
            <Input
              placeholder="Notes or observations"
              value={observation}
              onChange={e => setObservation(e.target.value)}
              className="w-full text-xs font-body"
            />
          </div>

          <div>
            <label className="text-[10px] font-pixel text-[var(--foreground)] mb-1 block">Tags</label>
            <div className="flex flex-wrap gap-1 mb-2">
              {tags.map(tag => (
                <Badge
                  key={tag}
                  variant="outline"
                  font="pixel"
                  className="text-[8px] px-1.5 py-0.5 bg-gray-100 text-gray-600 border-none cursor-pointer gap-1"
                  onClick={() => handleRemoveTag(tag)}
                >
                  {tag}
                  <span className="text-[10px] ml-0.5">&times;</span>
                </Badge>
              ))}
            </div>
            <div className="flex gap-1">
              <Input
                placeholder="Add tag..."
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                className="flex-1 text-xs font-body"
              />
              <Button
                onClick={handleAddTag}
                variant="secondary"
                size="sm"
                disabled={!tagInput.trim()}
              >
                +
              </Button>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-pixel text-[var(--foreground)] mb-1 block">Can be SaaS</label>
            <Select value={canBeSaas || '_none'} onValueChange={v => setCanBeSaas(v === '_none' ? '' : v)}>
              <SelectTrigger font="pixel" className="w-full text-[9px]">
                <SelectValue placeholder="Not specified" />
              </SelectTrigger>
              <SelectContent font="pixel" className="text-[9px] bg-white">
                <SelectItem value="_none">Not specified</SelectItem>
                <SelectItem value="Yes">Yes</SelectItem>
                <SelectItem value="No">No</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={handleSave}
            disabled={!name.trim() || saving}
            size="sm"
          >
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
