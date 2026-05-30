import { useCallback } from 'react';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import { useProject, useFilteredIssues } from '../context/ProjectContext';
import { useAppMeta } from '../context/AppMetaContext';
import IssueCard from '../components/IssueCard';
import Filters from '../components/Filters';

const COLUMNS = [
    { id: 'TO DO',       color: 'var(--status-todo)' },
    { id: 'IN PROGRESS', color: 'var(--status-inprogress)' },
    { id: 'IN REVIEW',   color: 'var(--status-inreview)' },
    { id: 'DONE',        color: 'var(--status-done)' },
];

export default function Board() {
    const { updateIssueStatus, loadingIssues } = useProject();
    const { getUser } = useAppMeta();
    const issues = useFilteredIssues();

    const getColumnIssues = useCallback(
        (status) => issues.filter((i) => i.status === status),
        [issues]
    );

    const onDragEnd = useCallback(
        (result) => {
            if (!result.destination) return;
            const { draggableId, destination } = result;
            updateIssueStatus(draggableId, destination.droppableId);
        },
        [updateIssueStatus]
    );

    if (loadingIssues) {
        return (
            <div>
                <div className="board-header"><h1>Board</h1></div>
                <div className="board-loading">Loading issues…</div>
            </div>
        );
    }

    return (
        <div>
            <div className="board-header">
                <h1>Dashboard</h1>
            </div>

            <Filters />

            <DragDropContext onDragEnd={onDragEnd}>
                <div className="board-columns">
                    {COLUMNS.map((col) => {
                        const colIssues = getColumnIssues(col.id);
                        return (
                            <div key={col.id} className="board-column">
                                <div className="colucolmn-header">
                                    <div className="column-title">
                                        <span className="dot" style={{ background: col.color }} />
                                        {col.id}
                                    </div>
                                    <span className="column-count">{colIssues.length}</span>
                                </div>
                                <Droppable droppableId={col.id}>
                                    {(provided, snapshot) => (
                                        <div
                                            className="column-cards"
                                            ref={provided.innerRef}
                                            {...provided.droppableProps}
                                            style={{
                                                background: snapshot.isDraggingOver
                                                    ? 'var(--bg-surface-active)'
                                                    : undefined,
                                                transition: 'background 200ms ease',
                                            }}
                                        >
                                            {colIssues.map((issue, idx) => {
                                                const u = issue.assigneeId ? getUser(issue.assigneeId) : null;
                                                const assigneeName = u ? (u.displayName || u.username) : null;
                                                return (
                                                    <IssueCard
                                                        key={String(issue.id)}
                                                        issue={issue}
                                                        index={idx}
                                                        assigneeName={assigneeName}
                                                    />
                                                );
                                            })}
                                            {provided.placeholder}
                                            {colIssues.length === 0 && (
                                                <div className="empty-state">
                                                    <p style={{ fontSize: 12 }}>No issues</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </Droppable>
                            </div>
                        );
                    })}
                </div>
            </DragDropContext>

        </div>
    );
}
