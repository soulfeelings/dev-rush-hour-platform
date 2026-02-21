import { useState, useEffect, useCallback } from 'react'
import { Trash2, Pencil, UserPlus } from 'lucide-react'
import { adminFetch } from '../../../../utils/adminApi'
import { Button, Checkbox, Input, Modal, ModalBody, ModalFooter } from '../../../../ui'
import styles from './TeamPage.module.scss'

// ─── Types ───────────────────────────────────────────────────────────────────

type AdminUser = {
  id: string
  email: string
  role: 'superadmin' | 'admin'
  permissions: string[]
  createdAt: string
  createdBy: string
}

// ─── Permission matrix config ────────────────────────────────────────────────

const ENTITIES = [
  'cities',
  'areas',
  'developers',
  'projects',
  'lots',
  'badges',
  'infrastructures',
  'media',
] as const

const ACTIONS = ['view', 'create', 'update', 'delete'] as const

type Entity = (typeof ENTITIES)[number]
type Action = (typeof ACTIONS)[number]

function permKey(entity: Entity, action: Action) {
  return `${entity}:${action}`
}

function buildPermissions(matrix: Record<string, boolean>): string[] {
  return Object.entries(matrix)
    .filter(([, checked]) => checked)
    .map(([key]) => key)
}

function matrixFromPermissions(permissions: string[]): Record<string, boolean> {
  const matrix: Record<string, boolean> = {}
  for (const entity of ENTITIES) {
    for (const action of ACTIONS) {
      matrix[permKey(entity, action)] = permissions.includes(permKey(entity, action))
    }
  }
  return matrix
}

// ─── Permission matrix component ─────────────────────────────────────────────

function PermissionMatrix({
  matrix,
  onChange,
}: {
  matrix: Record<string, boolean>
  onChange: (key: string, checked: boolean) => void
}) {
  const isEntityAllChecked = (entity: Entity) =>
    ACTIONS.every(a => matrix[permKey(entity, a)])
  const isActionAllChecked = (action: Action) =>
    ENTITIES.every(e => matrix[permKey(e, action)])

  const toggleEntity = (entity: Entity) => {
    const allChecked = isEntityAllChecked(entity)
    for (const action of ACTIONS) {
      onChange(permKey(entity, action), !allChecked)
    }
  }

  const toggleAction = (action: Action) => {
    const allChecked = isActionAllChecked(action)
    for (const entity of ENTITIES) {
      onChange(permKey(entity, action), !allChecked)
    }
  }

  return (
    <div className={styles.matrixWrapper}>
      <table className={styles.matrix}>
        <thead>
          <tr>
            <th className={styles.matrixEntityCell}>Entity</th>
            {ACTIONS.map(action => (
              <th key={action} className={styles.matrixActionCell}>
                <div className={styles.matrixActionHeader}>
                  <Checkbox
                    checked={isActionAllChecked(action)}
                    onChange={() => toggleAction(action)}
                    aria-label={`Toggle all ${action}`}
                  />
                  <span>{action}</span>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ENTITIES.map(entity => (
            <tr key={entity}>
              <td className={styles.matrixEntityCell}>
                <div className={styles.matrixEntityLabel}>
                  <Checkbox
                    checked={isEntityAllChecked(entity)}
                    onChange={() => toggleEntity(entity)}
                    aria-label={`Toggle all ${entity}`}
                  />
                  <span>{entity}</span>
                </div>
              </td>
              {ACTIONS.map(action => (
                <td key={action} className={styles.matrixCheckCell}>
                  <Checkbox
                    checked={!!matrix[permKey(entity, action)]}
                    onChange={e => onChange(permKey(entity, action), e.target.checked)}
                    aria-label={`${entity}:${action}`}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function TeamPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  // Add modal state
  const [addOpen, setAddOpen] = useState(false)
  const [newEmail, setNewEmail] = useState('')
  const [newMatrix, setNewMatrix] = useState<Record<string, boolean>>(
    matrixFromPermissions([])
  )

  // Edit modal state
  const [editUser, setEditUser] = useState<AdminUser | null>(null)
  const [editMatrix, setEditMatrix] = useState<Record<string, boolean>>({})

  // Remove modal state
  const [removeUser, setRemoveUser] = useState<AdminUser | null>(null)

  const fetchTeam = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await adminFetch('/admin/team', { method: 'GET' })
      if (!res.ok) throw new Error('Failed to load team')
      const data: AdminUser[] = await res.json()
      setUsers(data.map(u => ({ ...u, permissions: u.permissions ?? [] })))
    } catch {
      setError('Failed to load team members')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTeam()
  }, [fetchTeam])

  // ── Add ──────────────────────────────────────────────────────────────────

  const handleOpenAdd = () => {
    setNewEmail('')
    setNewMatrix(matrixFromPermissions([]))
    setAddOpen(true)
  }

  const handleAdd = async () => {
    if (!newEmail.trim()) return
    setSaving(true)
    try {
      const res = await adminFetch('/admin/team', {
        method: 'POST',
        body: JSON.stringify({
          email: newEmail.trim(),
          role: 'admin',
          permissions: buildPermissions(newMatrix),
        }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        setError(body.error || 'Failed to add member')
        return
      }
      setAddOpen(false)
      fetchTeam()
    } catch {
      setError('Failed to add team member')
    } finally {
      setSaving(false)
    }
  }

  // ── Edit ─────────────────────────────────────────────────────────────────

  const handleOpenEdit = (user: AdminUser) => {
    setEditUser(user)
    setEditMatrix(matrixFromPermissions(user.permissions))
  }

  const handleSaveEdit = async () => {
    if (!editUser) return
    setSaving(true)
    try {
      const res = await adminFetch(`/admin/team/${editUser.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          role: editUser.role,
          permissions: buildPermissions(editMatrix),
        }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        setError(body.error || 'Failed to update permissions')
        return
      }
      setEditUser(null)
      fetchTeam()
    } catch {
      setError('Failed to update permissions')
    } finally {
      setSaving(false)
    }
  }

  // ── Remove ───────────────────────────────────────────────────────────────

  const handleConfirmRemove = async () => {
    if (!removeUser) return
    setSaving(true)
    try {
      const res = await adminFetch(`/admin/team/${removeUser.id}`, { method: 'DELETE' })
      if (!res.ok) {
        setError('Failed to remove team member')
        return
      }
      setRemoveUser(null)
      fetchTeam()
    } catch {
      setError('Failed to remove team member')
    } finally {
      setSaving(false)
    }
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.header}>
          <h2 className={styles.title}>Team</h2>
        </div>
        <div className={styles.loading}>Loading team members…</div>
      </div>
    )
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h2 className={styles.title}>Team</h2>
        <Button onClick={handleOpenAdd} iconLeft={<UserPlus size={16} />}>
          Invite
        </Button>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {users.length === 0 ? (
        <div className={styles.empty}>No team members yet</div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Email</th>
                <th>Role</th>
                <th>Permissions</th>
                <th>Added by</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td className={styles.emailCell}>{user.email}</td>
                  <td>
                    <span className={`${styles.roleBadge} ${styles[`role_${user.role}`]}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className={styles.permissionsCell}>
                    {user.role === 'superadmin' ? (
                      <span className={styles.superadminNote}>all permissions</span>
                    ) : user.permissions.length === 0 ? (
                      <span className={styles.noPerms}>none</span>
                    ) : (
                      <span className={styles.permCount}>
                        {user.permissions.length} permission{user.permissions.length !== 1 ? 's' : ''}
                      </span>
                    )}
                  </td>
                  <td className={styles.createdByCell}>{user.createdBy || '—'}</td>
                  <td className={styles.actionsCell}>
                    {user.role !== 'superadmin' && (
                      <div className={styles.rowActions}>
                        <button
                          type="button"
                          className={styles.iconBtn}
                          onClick={() => handleOpenEdit(user)}
                          title="Edit permissions"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          type="button"
                          className={`${styles.iconBtn} ${styles.iconBtnDanger}`}
                          onClick={() => setRemoveUser(user)}
                          title="Remove access"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Add modal ─────────────────────────────────────────────────── */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Invite team member">
        <ModalBody>
          <div className={styles.howItWorks}>
            <p className={styles.howItWorksTitle}>How it works</p>
            <ol className={styles.howItWorksList}>
              <li>Enter the person's Microsoft work email and set their permissions</li>
              <li>They go to <strong>/admin</strong> and sign in with their Microsoft account</li>
              <li>Access is granted automatically — no email is sent</li>
            </ol>
          </div>
          <div className={styles.modalField}>
            <Input
              label="Email"
              type="email"
              value={newEmail}
              onChange={e => setNewEmail(e.target.value)}
              placeholder="admin@company.com"
              autoFocus
            />
          </div>
          <div className={styles.modalSection}>
            <p className={styles.modalSectionLabel}>Permissions</p>
            <PermissionMatrix
              matrix={newMatrix}
              onChange={(key, checked) =>
                setNewMatrix(prev => ({ ...prev, [key]: checked }))
              }
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setAddOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleAdd} disabled={!newEmail.trim() || saving}>
            {saving ? 'Inviting…' : 'Invite'}
          </Button>
        </ModalFooter>
      </Modal>

      {/* ── Edit modal ────────────────────────────────────────────────── */}
      <Modal open={!!editUser} onClose={() => setEditUser(null)} title={`Edit permissions — ${editUser?.email}`}>
        <ModalBody>
          <PermissionMatrix
            matrix={editMatrix}
            onChange={(key, checked) =>
              setEditMatrix(prev => ({ ...prev, [key]: checked }))
            }
          />
        </ModalBody>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setEditUser(null)}>
            Cancel
          </Button>
          <Button onClick={handleSaveEdit} disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </ModalFooter>
      </Modal>

      {/* ── Remove confirm modal ──────────────────────────────────────── */}
      <Modal open={!!removeUser} onClose={() => setRemoveUser(null)} title="Remove access">
        <ModalBody>
          <p>
            Remove <strong>{removeUser?.email}</strong> from the admin team? They will immediately
            lose access.
          </p>
        </ModalBody>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setRemoveUser(null)}>
            Cancel
          </Button>
          <Button variant="secondary" onClick={handleConfirmRemove} disabled={saving} className={styles.dangerBtn}>
            {saving ? 'Removing…' : 'Remove'}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  )
}
