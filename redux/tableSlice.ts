import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from './store';

interface TableState {
    [tableId: string]: {
        columnVisibility: { [columnId: string]: boolean };
    };
}

const initialState: TableState = {};

const tableSlice = createSlice({
    name: 'table',
    initialState,
    reducers: {
        setColumnVisibility: (
            state,
            action: PayloadAction<{ tableId: string; columnId: string; isVisible: boolean }>
        ) => {
            const { tableId, columnId, isVisible } = action.payload;
            if (!state[tableId]) {
                state[tableId] = { columnVisibility: {} };
            }
            state[tableId].columnVisibility[columnId] = isVisible;
        },
        initializeColumnVisibility: (
            state,
            action: PayloadAction<{ tableId: string; columns: { columnId: string; isVisible: boolean }[] }>
        ) => {
            const { tableId, columns } = action.payload;
            state[tableId] = { columnVisibility: {} };
            columns.forEach(({ columnId, isVisible }) => {
                state[tableId].columnVisibility[columnId] = isVisible;
            });
        },
    },
});

export const { setColumnVisibility, initializeColumnVisibility } = tableSlice.actions;

export const selectColumnVisibility = (state: RootState, tableId: string) => state.table[tableId]?.columnVisibility || {};

export const getColumnVisibility = (table: any, tableId: string) => {
    return table[tableId]?.columnVisibility || {};
}
export default tableSlice.reducer;