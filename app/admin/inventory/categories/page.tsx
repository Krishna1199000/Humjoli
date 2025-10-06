"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Edit, Plus, Trash2 } from "lucide-react"
import { toast } from "react-hot-toast"

interface Category {
  id: string
  name: string
  description?: string | null
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [newName, setNewName] = useState("")
  const [newDesc, setNewDesc] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState("")
  const [editDesc, setEditDesc] = useState("")

  const load = async () => {
    try {
      const res = await fetch('/api/categories')
      if (!res.ok) throw new Error('Failed to load categories')
      setCategories(await res.json())
    } catch (e) {
      console.error(e)
      toast.error('Failed to load categories')
    }
  }

  useEffect(() => { load() }, [])

  const add = async () => {
    const name = newName.trim()
    if (!name) return toast.error('Name is required')
    setLoading(true)
    try {
      const res = await fetch('/api/categories', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, description: newDesc.trim() || undefined }) })
      if (res.status === 409) return toast.error('Category already exists')
      if (!res.ok) throw new Error('Failed to create')
      setNewName("")
      setNewDesc("")
      await load()
      toast.success('Category added')
    } catch (e) {
      console.error(e)
      toast.error('Failed to add category')
    } finally {
      setLoading(false)
    }
  }

  const startEdit = (cat: Category) => {
    setEditingId(cat.id)
    setEditName(cat.name)
    setEditDesc(cat.description || "")
  }

  const saveEdit = async () => {
    if (!editingId) return
    const name = editName.trim()
    if (!name) return toast.error('Name is required')
    setLoading(true)
    try {
      const res = await fetch(`/api/categories/${editingId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, description: editDesc.trim() }) })
      if (res.status === 409) return toast.error('Category name already exists')
      if (!res.ok) throw new Error('Failed to update')
      setEditingId(null)
      await load()
      toast.success('Category updated')
    } catch (e) {
      console.error(e)
      toast.error('Failed to update category')
    } finally {
      setLoading(false)
    }
  }

  const remove = async (id: string) => {
    if (!confirm('Delete this category?')) return
    setLoading(true)
    try {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error(data?.error || 'Failed to delete')
        return
      }
      await load()
      toast.success('Category deleted')
    } catch (e) {
      console.error(e)
      toast.error('Failed to delete category')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Inventory Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-6">
            <Input placeholder="New category name" value={newName} onChange={(e) => setNewName(e.target.value)} />
            <Input placeholder="Description (optional)" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} />
            <Button onClick={add} disabled={loading}>
              <Plus className="mr-2 h-4 w-4" /> Add
            </Button>
          </div>

          <div className="space-y-3">
            {categories.map(cat => (
              <div key={cat.id} className="flex items-center gap-2 border rounded-md p-3">
                {editingId === cat.id ? (
                  <>
                    <Input className="flex-1" value={editName} onChange={(e) => setEditName(e.target.value)} />
                    <Input className="flex-1" value={editDesc} onChange={(e) => setEditDesc(e.target.value)} />
                    <Button variant="outline" onClick={() => setEditingId(null)}>Cancel</Button>
                    <Button onClick={saveEdit} disabled={loading}>Save</Button>
                  </>
                ) : (
                  <>
                    <div className="flex-1">
                      <div className="font-medium">{cat.name}</div>
                      {cat.description ? <div className="text-sm text-gray-500">{cat.description}</div> : null}
                    </div>
                    <Button variant="outline" onClick={() => startEdit(cat)}>
                      <Edit className="h-4 w-4 mr-1" /> Edit
                    </Button>
                    <Button variant="destructive" onClick={() => remove(cat.id)}>
                      <Trash2 className="h-4 w-4 mr-1" /> Delete
                    </Button>
                  </>
                )}
              </div>
            ))}
            {categories.length === 0 && (
              <div className="text-sm text-gray-500">No categories yet.</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}








