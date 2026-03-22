import { useState, useEffect } from 'react'
import { api } from '../../utils/api'
import { Card, Button, Input, Badge, Spinner, EmptyState, SectionTitle } from '../UI'
import styles from './DashPanels.module.css'

const EMPTY_ADD = { name: '', price: '', ingredients: '', recipe: '' }
const EMPTY_EDIT = { dishId: '', price: '', ingredients: '', recipe: '' }

export default function MenuManage() {
  const [dishes, setDishes] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeForm, setActiveForm] = useState(null) // 'add' | 'edit'
  const [addForm, setAddForm] = useState(EMPTY_ADD)
  const [editForm, setEditForm] = useState(EMPTY_EDIT)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

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
    if (editForm.price) payload.price = Number(editForm.price)
    if (editForm.ingredients) payload.ingredients = editForm.ingredients.split(',').map(s => s.trim()).filter(Boolean)
    if (editForm.recipe) payload.recipe = editForm.recipe.trim()
    try {
      await api.updateDish(payload)
      setSuccess(`Dish #${editForm.dishId} updated`)
      setEditForm(EMPTY_EDIT)
      setActiveForm(null)
      load()
    } catch (e) { setError(e.message) }
    finally { setSubmitting(false) }
  }

  function prefillEdit(dish) {
    setEditForm({
      dishId: String(dish.dishId),
      price: String(dish.price),
      ingredients: dish.ingredients?.join(', ') || '',
      recipe: dish.recipe || '',
    })
    setActiveForm('edit')
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
          <Button variant="ghost" size="sm" onClick={() => { setActiveForm(activeForm === 'edit' ? null : 'edit'); setError('') }}>
            {activeForm === 'edit' ? '✕ Cancel' : '✎ Edit Dish'}
          </Button>
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
            <Input label="Price (₹)" type="number" value={addForm.price} onChange={setA('price')} placeholder="280" />
            <Input
              label="Ingredients (comma separated)"
              value={addForm.ingredients}
              onChange={setA('ingredients')}
              placeholder="paneer, peanut oil, yogurt, spices"
              hint="Used for AI allergy detection"
            />
            <Input label="Recipe (optional)" value={addForm.recipe} onChange={setA('recipe')} placeholder="Internal kitchen notes…" />
            <Button type="submit" loading={submitting} fullWidth>Add Dish →</Button>
          </form>
        </Card>
      )}

      {/* Edit form */}
      {activeForm === 'edit' && (
        <Card className={`${styles.addForm} animate-fade-up`} glow="cyan">
          <div className={`${styles.formTitle} mono`}>EDIT DISH — click a dish below to prefill</div>
          <form onSubmit={handleEdit} className={styles.inventoryForm}>
            <Input label="Dish ID" type="number" value={editForm.dishId} onChange={setE('dishId')} placeholder="1" />
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
                style={{ animationDelay: `${i * 0.04}s` }}
              >
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

                <div style={{ marginTop: 12 }}>
                  <Button variant="ghost" size="sm" onClick={() => prefillEdit(dish)}>
                    ✎ Edit
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
