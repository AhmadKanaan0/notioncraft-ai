'use client';

import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    flexRender,
    type ColumnDef,
    type SortingState,
    type RowSelectionState,
} from '@tanstack/react-table';
import { useState, useCallback, useMemo } from 'react';
import {
    ArrowUpDown,
    PlusCircle,
    Trash2,
    ChevronLeft,
    ChevronRight,
    Search,
    Columns,
    Check,
    X,
    MoreVertical,
    Pencil,
    Bold,
    Italic,
    Palette,
    Highlighter,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface CellStyle {
    bold?: boolean;
    italic?: boolean;
    textColor?: string;
    bgColor?: string;
}

interface CellData {
    value: string;
    style?: CellStyle;
}

interface DataTableColumn {
    id: string;
    header: string;
}

interface DataTableRow {
    id: string;
    [key: string]: string | CellData;
}

interface DataTableComponentProps {
    initialData?: DataTableRow[];
    initialColumns?: DataTableColumn[];
    onDataChange?: (data: DataTableRow[], columns: DataTableColumn[]) => void;
}

const TEXT_COLORS = [
    { name: 'Default', value: '' },
    { name: 'Gray', value: '#6b7280' },
    { name: 'Red', value: '#ef4444' },
    { name: 'Orange', value: '#f97316' },
    { name: 'Green', value: '#22c55e' },
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Purple', value: '#a855f7' },
];

const BG_COLORS = [
    { name: 'None', value: '' },
    { name: 'Yellow', value: '#fef08a' },
    { name: 'Green', value: '#bbf7d0' },
    { name: 'Blue', value: '#bfdbfe' },
    { name: 'Pink', value: '#fbcfe8' },
    { name: 'Orange', value: '#fed7aa' },
    { name: 'Purple', value: '#ddd6fe' },
];

const defaultColumns: DataTableColumn[] = [
    { id: 'col1', header: 'Name' },
    { id: 'col2', header: 'Email' },
    { id: 'col3', header: 'Role' },
];

const defaultData: DataTableRow[] = [
    { id: '1', col1: { value: 'John Doe' }, col2: { value: 'john@example.com' }, col3: { value: 'Admin' } },
    { id: '2', col1: { value: 'Jane Smith' }, col2: { value: 'jane@example.com' }, col3: { value: 'Editor' } },
    { id: '3', col1: { value: 'Bob Wilson' }, col2: { value: 'bob@example.com' }, col3: { value: 'Viewer' } },
];

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

// Helper to get cell data
const getCellData = (cell: string | CellData | undefined): CellData => {
    if (!cell) return { value: '' };
    if (typeof cell === 'string') return { value: cell };
    return cell;
};

export function DataTableComponent({
    initialData,
    initialColumns,
    onDataChange,
}: DataTableComponentProps) {
    const [data, setData] = useState<DataTableRow[]>(initialData || defaultData);
    const [tableColumns, setTableColumns] = useState<DataTableColumn[]>(
        initialColumns || defaultColumns
    );
    const [sorting, setSorting] = useState<SortingState>([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
    const [editingCell, setEditingCell] = useState<{ rowId: string; colId: string } | null>(null);
    const [editValue, setEditValue] = useState('');
    const [editStyle, setEditStyle] = useState<CellStyle>({});
    const [newColumnName, setNewColumnName] = useState('');
    const [editingColumnId, setEditingColumnId] = useState<string | null>(null);
    const [editingColumnName, setEditingColumnName] = useState('');
    const [pageSize, setPageSize] = useState(5);

    const updateData = useCallback(
        (newData: DataTableRow[], newColumns?: DataTableColumn[]) => {
            setData(newData);
            if (newColumns) {
                setTableColumns(newColumns);
            }
            onDataChange?.(newData, newColumns || tableColumns);
        },
        [onDataChange, tableColumns]
    );

    const addRow = useCallback(() => {
        const newRow: DataTableRow = { id: String(Date.now()) };
        tableColumns.forEach((col) => {
            newRow[col.id] = { value: '' };
        });
        updateData([...data, newRow]);
    }, [data, tableColumns, updateData]);

    const deleteSelectedRows = useCallback(() => {
        const selectedIds = Object.keys(rowSelection);
        if (selectedIds.length === 0) return;
        updateData(data.filter((_, index) => !rowSelection[index]));
        setRowSelection({});
    }, [data, rowSelection, updateData]);

    const addColumn = useCallback(() => {
        if (!newColumnName.trim()) return;
        const newColId = `col_${Date.now()}`;
        const newCol: DataTableColumn = { id: newColId, header: newColumnName };
        const newColumns = [...tableColumns, newCol];
        const newData = data.map((row) => ({ ...row, [newColId]: { value: '' } }));
        updateData(newData, newColumns);
        setNewColumnName('');
    }, [data, newColumnName, tableColumns, updateData]);

    const deleteColumn = useCallback((colId: string) => {
        if (tableColumns.length <= 1) return;
        const newColumns = tableColumns.filter((col) => col.id !== colId);
        const newData = data.map((row) => {
            const { [colId]: _, ...rest } = row;
            return rest as DataTableRow;
        });
        updateData(newData, newColumns);
    }, [data, tableColumns, updateData]);

    const startEditingColumn = useCallback((colId: string, currentName: string) => {
        setEditingColumnId(colId);
        setEditingColumnName(currentName);
    }, []);

    const saveColumnName = useCallback(() => {
        if (!editingColumnId || !editingColumnName.trim()) return;
        const newColumns = tableColumns.map((col) =>
            col.id === editingColumnId ? { ...col, header: editingColumnName } : col
        );
        updateData(data, newColumns);
        setEditingColumnId(null);
        setEditingColumnName('');
    }, [data, editingColumnId, editingColumnName, tableColumns, updateData]);

    const cancelEditingColumn = useCallback(() => {
        setEditingColumnId(null);
        setEditingColumnName('');
    }, []);

    const startEditing = useCallback((rowId: string, colId: string, cellData: CellData) => {
        setEditingCell({ rowId, colId });
        setEditValue(cellData.value);
        setEditStyle(cellData.style || {});
    }, []);

    const saveEdit = useCallback(() => {
        if (!editingCell) return;
        updateData(
            data.map((row) =>
                row.id === editingCell.rowId
                    ? { ...row, [editingCell.colId]: { value: editValue, style: editStyle } }
                    : row
            )
        );
        setEditingCell(null);
        setEditValue('');
        setEditStyle({});
    }, [data, editingCell, editValue, editStyle, updateData]);

    const cancelEdit = useCallback(() => {
        setEditingCell(null);
        setEditValue('');
        setEditStyle({});
    }, []);

    const toggleBold = useCallback(() => {
        setEditStyle((prev) => ({ ...prev, bold: !prev.bold }));
    }, []);

    const toggleItalic = useCallback(() => {
        setEditStyle((prev) => ({ ...prev, italic: !prev.italic }));
    }, []);

    const setTextColor = useCallback((color: string) => {
        setEditStyle((prev) => ({ ...prev, textColor: color }));
    }, []);

    const setBgColor = useCallback((color: string) => {
        setEditStyle((prev) => ({ ...prev, bgColor: color }));
    }, []);

    const columns: ColumnDef<DataTableRow>[] = useMemo(() => {
        const selectColumn: ColumnDef<DataTableRow> = {
            id: 'select',
            header: ({ table }) => (
                <Checkbox
                    checked={table.getIsAllPageRowsSelected()}
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                    className="translate-y-[2px]"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                    className="translate-y-[2px]"
                />
            ),
            enableSorting: false,
            enableHiding: false,
        };

        const dataColumns: ColumnDef<DataTableRow>[] = tableColumns.map((col) => ({
            accessorKey: col.id,
            header: ({ column }) => {
                const isEditing = editingColumnId === col.id;

                if (isEditing) {
                    return (
                        <div className="flex items-center gap-1">
                            <Input
                                value={editingColumnName}
                                onChange={(e) => setEditingColumnName(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') saveColumnName();
                                    if (e.key === 'Escape') cancelEditingColumn();
                                }}
                                className="h-7 text-sm w-24"
                                autoFocus
                            />
                            <Button variant="ghost" size="sm" onClick={saveColumnName} className="h-7 w-7 p-0 text-green-600">
                                <Check className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={cancelEditingColumn} className="h-7 w-7 p-0 text-red-600">
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    );
                }

                return (
                    <div className="flex items-center gap-1">
                        <Button
                            variant="ghost"
                            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                            className="h-auto p-1 font-semibold hover:bg-transparent"
                        >
                            {col.header}
                            <ArrowUpDown className="ml-2 h-3.5 w-3.5 opacity-50" />
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-50 hover:opacity-100">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => startEditingColumn(col.id, col.header)}>
                                    <Pencil className="h-4 w-4 mr-2" />
                                    Rename Column
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={() => deleteColumn(col.id)}
                                    className="text-destructive focus:text-destructive"
                                    disabled={tableColumns.length <= 1}
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete Column
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                );
            },
            cell: ({ row }) => {
                const cellData = getCellData(row.original[col.id]);
                const isEditing = editingCell?.rowId === row.original.id && editingCell?.colId === col.id;

                if (isEditing) {
                    return (
                        <div className="space-y-2">
                            {/* Formatting Toolbar */}
                            <div className="flex items-center gap-1 p-1 rounded-md bg-muted/50 border border-border">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={toggleBold}
                                    className={cn('h-7 w-7 p-0', editStyle.bold && 'bg-accent')}
                                    title="Bold"
                                >
                                    <Bold className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={toggleItalic}
                                    className={cn('h-7 w-7 p-0', editStyle.italic && 'bg-accent')}
                                    title="Italic"
                                >
                                    <Italic className="h-4 w-4" />
                                </Button>
                                <div className="w-px h-5 bg-border mx-1" />
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" title="Text Color">
                                            <Palette className="h-4 w-4" style={{ color: editStyle.textColor || undefined }} />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-2">
                                        <div className="flex gap-1">
                                            {TEXT_COLORS.map((color) => (
                                                <button
                                                    key={color.value}
                                                    className={cn(
                                                        'w-6 h-6 rounded border border-border flex items-center justify-center text-xs',
                                                        editStyle.textColor === color.value && 'ring-2 ring-primary'
                                                    )}
                                                    style={{ color: color.value || 'inherit' }}
                                                    onClick={() => setTextColor(color.value)}
                                                    title={color.name}
                                                >
                                                    A
                                                </button>
                                            ))}
                                        </div>
                                    </PopoverContent>
                                </Popover>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" title="Background">
                                            <Highlighter className="h-4 w-4" style={{ color: editStyle.bgColor || undefined }} />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-2">
                                        <div className="flex gap-1">
                                            {BG_COLORS.map((color) => (
                                                <button
                                                    key={color.value}
                                                    className={cn(
                                                        'w-6 h-6 rounded border border-border',
                                                        editStyle.bgColor === color.value && 'ring-2 ring-primary'
                                                    )}
                                                    style={{ backgroundColor: color.value || 'transparent' }}
                                                    onClick={() => setBgColor(color.value)}
                                                    title={color.name}
                                                />
                                            ))}
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            </div>
                            {/* Input */}
                            <div className="flex items-center gap-1">
                                <Input
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') saveEdit();
                                        if (e.key === 'Escape') cancelEdit();
                                    }}
                                    className="h-7 text-sm"
                                    style={{
                                        fontWeight: editStyle.bold ? 'bold' : 'normal',
                                        fontStyle: editStyle.italic ? 'italic' : 'normal',
                                        color: editStyle.textColor || 'inherit',
                                        backgroundColor: editStyle.bgColor || 'transparent',
                                    }}
                                    autoFocus
                                />
                                <Button variant="ghost" size="sm" onClick={saveEdit} className="h-7 w-7 p-0 text-green-600">
                                    <Check className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={cancelEdit} className="h-7 w-7 p-0 text-red-600">
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    );
                }

                const style = cellData.style || {};
                return (
                    <div
                        className="cursor-pointer rounded px-2 py-1 hover:bg-muted/50 min-h-[28px]"
                        style={{
                            fontWeight: style.bold ? 'bold' : 'normal',
                            fontStyle: style.italic ? 'italic' : 'normal',
                            color: style.textColor || 'inherit',
                            backgroundColor: style.bgColor || 'transparent',
                        }}
                        onClick={() => startEditing(row.original.id, col.id, cellData)}
                    >
                        {cellData.value || <span className="text-muted-foreground italic font-normal">Empty</span>}
                    </div>
                );
            },
        }));

        return [selectColumn, ...dataColumns];
    }, [tableColumns, editingCell, editValue, editStyle, saveEdit, cancelEdit, startEditing, editingColumnId, editingColumnName, saveColumnName, cancelEditingColumn, startEditingColumn, deleteColumn, toggleBold, toggleItalic, setTextColor, setBgColor]);

    const [pageIndex, setPageIndex] = useState(0);
    const [searchColumn, setSearchColumn] = useState<string>('all');

    // Custom filter function to search within CellData objects
    const globalFilterFn = useCallback(
        (row: { original: DataTableRow }, columnId: string, filterValue: string) => {
            if (!filterValue) return true;
            const searchTerm = filterValue.toLowerCase();

            // If specific column is selected, only search that column
            if (searchColumn !== 'all') {
                const cellData = getCellData(row.original[searchColumn]);
                return cellData.value.toLowerCase().includes(searchTerm);
            }

            // Search through all columns
            for (const col of tableColumns) {
                const cellData = getCellData(row.original[col.id]);
                if (cellData.value.toLowerCase().includes(searchTerm)) {
                    return true;
                }
            }
            return false;
        },
        [tableColumns, searchColumn]
    );

    const table = useReactTable({
        data,
        columns,
        state: { sorting, globalFilter, rowSelection, pagination: { pageIndex, pageSize } },
        onSortingChange: setSorting,
        onGlobalFilterChange: setGlobalFilter,
        onRowSelectionChange: setRowSelection,
        onPaginationChange: (updater) => {
            if (typeof updater === 'function') {
                const newState = updater({ pageIndex, pageSize });
                setPageIndex(newState.pageIndex);
                setPageSize(newState.pageSize);
            }
        },
        globalFilterFn,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });

    const selectedCount = Object.keys(rowSelection).length;

    return (
        <div className="w-full rounded-xl border border-border bg-card shadow-sm overflow-hidden my-4" contentEditable={false}>
            {/* Header Toolbar */}
            <div className="flex flex-col gap-3 border-b border-border bg-muted/30 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <Select value={searchColumn} onValueChange={setSearchColumn}>
                        <SelectTrigger className="h-9 w-full text-sm sm:w-[120px]">
                            <SelectValue placeholder="All columns" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All columns</SelectItem>
                            {tableColumns.map((col) => (
                                <SelectItem key={col.id} value={col.id}>
                                    {col.header}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <div className="relative w-full sm:w-auto">
                        <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search..."
                            value={globalFilter}
                            onChange={(e) => setGlobalFilter(e.target.value)}
                            className="h-9 w-full pl-8 text-sm sm:w-[160px]"
                        />
                    </div>
                    {selectedCount > 0 && (
                        <Button variant="destructive" size="sm" onClick={deleteSelectedRows} className="gap-1 w-full sm:w-auto">
                            <Trash2 className="h-4 w-4" />
                            Delete ({selectedCount})
                        </Button>
                    )}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" size="sm" className="gap-1 flex-1 sm:flex-none">
                                <Columns className="h-4 w-4" />
                                Add Column
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-60 p-3" align="end">
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium">Column Name</label>
                                <Input
                                    placeholder="Enter column name"
                                    value={newColumnName}
                                    onChange={(e) => setNewColumnName(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && addColumn()}
                                    className="h-8"
                                />
                                <Button size="sm" onClick={addColumn} disabled={!newColumnName.trim()}>
                                    Add
                                </Button>
                            </div>
                        </PopoverContent>
                    </Popover>
                    <Button variant="outline" size="sm" onClick={addRow} className="gap-1 flex-1 sm:flex-none">
                        <PlusCircle className="h-4 w-4" />
                        Add Row
                    </Button>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full min-w-[600px] border-collapse">
                    <thead>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <tr key={headerGroup.id} className="border-b border-border bg-muted/50">
                                {headerGroup.headers.map((header) => (
                                    <th key={header.id} className="px-3 py-2.5 text-left text-sm font-medium text-muted-foreground">
                                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody>
                        {table.getRowModel().rows.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length} className="px-3 py-8 text-center text-sm text-muted-foreground">
                                    No results found.
                                </td>
                            </tr>
                        ) : (
                            table.getRowModel().rows.map((row) => (
                                <tr
                                    key={row.id}
                                    className={cn('border-b border-border transition-colors hover:bg-muted/30', row.getIsSelected() && 'bg-primary/5')}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <td key={cell.id} className="px-3 py-2 text-sm">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Footer */}
            <div className="flex flex-wrap items-center justify-between border-t border-border bg-muted/30 px-4 py-3 gap-4">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="text-sm text-muted-foreground">
                        {selectedCount > 0 ? `${selectedCount} of ${data.length} row(s) selected` : `${data.length} row(s) total`}
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Rows per page:</span>
                        <Select
                            value={String(pageSize)}
                            onValueChange={(value) => {
                                setPageSize(Number(value));
                                table.setPageSize(Number(value));
                            }}
                        >
                            <SelectTrigger className="h-8 w-[70px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {PAGE_SIZE_OPTIONS.map((size) => (
                                    <SelectItem key={size} value={String(size)}>
                                        {size}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                        Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount() || 1}
                    </span>
                    <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} className="h-8 w-8 p-0">
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} className="h-8 w-8 p-0">
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
