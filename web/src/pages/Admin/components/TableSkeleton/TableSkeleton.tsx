import { Skeleton } from '../../../../ui'
import styles from './TableSkeleton.module.scss'

type ColumnConfig = {
  width?: string
  isImage?: boolean
  isActions?: boolean
}

type TableSkeletonProps = {
  headers: string[]
  columns: ColumnConfig[]
  rows?: number
  className?: string
  minWidth?: string
}

export function TableSkeleton({
  headers,
  columns,
  rows = 5,
  className,
  minWidth,
}: TableSkeletonProps) {
  return (
    <div className={`${styles.tableWrapper} ${className || ''}`}>
      <table className={styles.table} style={minWidth ? { minWidth } : undefined}>
        <thead>
          <tr>
            {headers.map((header, index) => (
              <th key={index}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <tr key={rowIndex}>
              {columns.map((column, colIndex) => (
                <td
                  key={colIndex}
                  className={column.isActions ? styles.actionsCell : ''}
                  style={column.width ? { width: column.width } : undefined}
                >
                  {column.isImage ? (
                    <Skeleton variant="rectangular" width={60} height={60} />
                  ) : column.isActions ? (
                    <Skeleton variant="circular" width={16} height={16} />
                  ) : (
                    <Skeleton variant="text" width="80%" />
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
