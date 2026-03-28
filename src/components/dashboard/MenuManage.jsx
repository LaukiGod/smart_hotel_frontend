import { useState, useEffect } from 'react'
import { api } from '../../utils/api'
import { Card, Button, Input, Badge, Spinner, EmptyState, SectionTitle } from '../UI'
import styles from './DashPanels.module.css'

const EMPTY_ADD = { name: '', price: '', ingredients: '', recipe: '', imageUrl: '' }
const EMPTY_EDIT = { dishId: '', price: '', ingredients: '', recipe: '', imageUrl: '' }

export default function MenuManage() {
  const [dishes, setDishes]       = useState([])
  const [loading, setLoading]     = useState(true)
  const [activeForm, setActiveForm] = useState(null) // 'add' | 'edit'
  const [addForm, setAddForm]     = useState(EMPTY_ADD)
  const [editForm, setEditForm]   = useState(EMPTY_EDIT)
  const [editingId, setEditingId] = useState(null)   // _id of card being edited
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting]   = useState(null)
  const [error, setError]         = useState('')
  const [success, setSuccess]     = useState('')

  async function load() {
    setLoading(true)
    try { setDishes(await api.getMenu()) }
    catch (_) {}
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  function setA(f) { return (e) => setAddForm(x => ({ ...x, [f]: e.target.value })) }
  function setE(f) { return (e) => setEditForm(x => ({ ...x, [f]: e.target.value })) }

  async function handleAdd(e) {
    e.preventDefault()
    if (!addForm.name.trim() || !addForm.price) return
    setSubmitting(true); setError(''); setSuccess('')
    try {
      await api.addDish({
        name: addForm.name.trim(),
        price: Number(addForm.price),
        ingredients: addForm.ingredients.split(',').map(s => s.trim()).filter(Boolean),
        recipe: addForm.recipe.trim(),
        imageUrl: addForm.imageUrl.trim(),
      })
      setSuccess(`"${addForm.name}" added to menu`)
      setAddForm(EMPTY_ADD)
      setActiveForm(null)
      load()
    } catch (e) { setError(e.message) }
    finally { setSubmitting(false) }
  }

  async function handleEdit(e) {
    e.preventDefault()
    if (!editForm.dishId) return
    setSubmitting(true); setError(''); setSuccess('')
    const payload = { dishId: Number(editForm.dishId) }
    if (editForm.price)       payload.price       = Number(editForm.price)
    if (editForm.ingredients) payload.ingredients = editForm.ingredients.split(',').map(s => s.trim()).filter(Boolean)
    if (editForm.recipe)      payload.recipe      = editForm.recipe.trim()
    if (editForm.imageUrl)    payload.imageUrl    = editForm.imageUrl.trim()
    try {
      await api.updateDish(payload)
      setSuccess(`Dish updated successfully`)
      setEditForm(EMPTY_EDIT)
      setEditingId(null)
      setActiveForm(null)
      load()
    } catch (e) { setError(e.message) }
    finally { setSubmitting(false) }
  }

  async function handleDelete(dish) {
    if (!window.confirm(`Delete "${dish.name}" from the menu?`)) return
    setDeleting(dish._id); setError(''); setSuccess('')
    try {
      await api.deleteDish(dish._id)
      setSuccess(`"${dish.name}" deleted from menu`)
      load()
    } catch (e) { setError(e.message) }
    finally { setDeleting(null) }
  }

  function prefillEdit(dish) {
    setEditForm({
      dishId:      String(dish.dishId),
      price:       String(dish.price),
      ingredients: dish.ingredients?.join(', ') || '',
      recipe:      dish.recipe || '',
      imageUrl:    dish.imageUrl || '',
    })
    setEditingId(dish._id)
    setActiveForm('edit')
    setError('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function cancelEdit() {
    setActiveForm(null)
    setEditingId(null)
    setEditForm(EMPTY_EDIT)
    setError('')
  }

  if (loading) return <div className={styles.centered}><Spinner size={32} color="cyan" /></div>

  return (
    <div className={`${styles.panel} animate-fade-up`}>
      <div className={styles.panelHeader}>
        <div>
          <div className={`${styles.panelTag} mono`}>MENU</div>
          <h2 className={`${styles.panelTitle} display`}>Dish Management</h2>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {activeForm === 'edit' ? (
            <Button variant="ghost" size="sm" onClick={cancelEdit}>✕ Cancel Edit</Button>
          ) : (
            <Button variant="ghost" size="sm" onClick={() => { setActiveForm('edit'); setError('') }}>
              ✎ Edit Dish
            </Button>
          )}
          <Button size="sm" onClick={() => { setActiveForm(activeForm === 'add' ? null : 'add'); setError('') }}>
            {activeForm === 'add' ? '✕ Cancel' : '+ Add Dish'}
          </Button>
        </div>
      </div>

      {error && <div className={styles.errorBanner}>⚠ {error}</div>}
      {success && <div className={styles.successBanner}>✓ {success}</div>}

      {/* Add form */}
      {activeForm === 'add' && (
        <Card className={`${styles.addForm} animate-fade-up`} glow="ember">
          <div className={`${styles.formTitle} mono`}>ADD NEW DISH</div>
          <form onSubmit={handleAdd} className={styles.inventoryForm}>
            <Input label="Dish Name" value={addForm.name} onChange={setA('name')} placeholder="e.g. Paneer Tikka" />
            <Input label="Dish Image Url" value={addForm.imageUrl} onChange={setA('imageUrl')} placeholder="e.g. https://example.com/dish.jpg" />
            <Input label="Price (₹)" type="number" value={addForm.price} onChange={setA('price')} placeholder="280" />
            <Input label="Recipe (optional)" value={addForm.recipe} onChange={setA('recipe')} placeholder="Internal kitchen notes…" />
            <Input
            label="Ingredients (comma separated)"
            value={addForm.ingredients}
            onChange={setA('ingredients')}
            placeholder="paneer, peanut oil, yogurt, spices"
            hint="Used for AI allergy detection"
            />
            <Button type="submit" loading={submitting} fullWidth>Add Dish →</Button>
          </form>
        </Card>
      )}

      {/* Edit form */}
      {activeForm === 'edit' && (
        <Card className={`${styles.addForm} animate-fade-up`} glow="cyan">
          <div className={`${styles.formTitle} mono`}>
            {editingId ? `EDITING DISH #${editForm.dishId}` : 'EDIT DISH — click a dish below to prefill'}
          </div>
          <form onSubmit={handleEdit} className={styles.inventoryForm}>
            <Input label="Dish ID" type="number" value={editForm.dishId} onChange={setE('dishId')} placeholder="1" />
            <Input label="New Image Url" value={editForm.imageUrl} onChange={setE('imageUrl')} placeholder="Leave blank to keep current" />
            <Input label="New Price (₹)" type="number" value={editForm.price} onChange={setE('price')} placeholder="Leave blank to keep current" />
            <Input
              label="New Ingredients (comma separated)"
              value={editForm.ingredients}
              onChange={setE('ingredients')}
              placeholder="Leave blank to keep current"
            />
            <Input label="New Recipe" value={editForm.recipe} onChange={setE('recipe')} placeholder="Leave blank to keep current" />
            <Button type="submit" variant="cyan" loading={submitting} fullWidth>Update Dish →</Button>
          </form>
        </Card>
      )}

      {/* Dish grid */}
      {dishes.length === 0 ? (
        <EmptyState icon="✦" title="No dishes yet" sub="Add your first dish using the button above" />
      ) : (
        <>
          <SectionTitle mono>All Dishes ({dishes.length})</SectionTitle>
          <div className={styles.dishManageGrid}>
            {dishes.map((dish, i) => (
              <Card
                key={dish._id}
                className={`${styles.dishManageCard} animate-fade-up`}
                style={{
                  animationDelay: `${i * 0.04}s`,
                  outline: editingId === dish._id ? '2px solid var(--cyan, #00c8ff)' : 'none',
                }}
              >
                {dish.imageUrl && (
                  <img
                    src={dish.imageUrl}
                    alt={dish.name}
                    style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '8px' }}
                  />
                )}
                <div className={styles.dishManageTop}>
                  <div>
                    <div className={`${styles.dishManageId} mono`}>#{dish.dishId}</div>
                    <div className={styles.dishManageName}>{dish.name}</div>
                  </div>
                  <div className={`${styles.dishManagePrice} mono`}>₹{dish.price}</div>
                </div>

                {dish.ingredients?.length > 0 && (
                  <div className={styles.dishIngredients}>
                    {dish.ingredients.slice(0, 4).map(ing => (
                      <Badge key={ing} variant="default">{ing}</Badge>
                    ))}
                    {dish.ingredients.length > 4 && (
                      <Badge variant="default">+{dish.ingredients.length - 4} more</Badge>
                    )}
                  </div>
                )}

                <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                  <Button variant="ghost" size="sm" onClick={() => prefillEdit(dish)}>
                    ✎ Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    loading={deleting === dish._id}
                    onClick={() => handleDelete(dish)}
                    style={{ color: '#ff6b35' }}
                  >
                    {deleting === dish._id ? '…' : '✕ Delete'}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
