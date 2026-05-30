import { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Draggable } from '@hello-pangea/dnd';
import {
    IoBookmarkOutline,
    IoBugOutline,
    IoCheckboxOutline,
    IoFlashOutline,
    IoArrowUp,
    IoArrowDown,
    IoRemove,
} from 'react-icons/io5';

const typeIcons = {
    Story: <IoBookmarkOutline />,
    Bug:   <IoBugOutline />,
    Task:  <IoCheckboxOutline />,
    Epic:  <IoFlashOutline />,
};

const priorityIcons = {
    Highest: <IoArrowUp style={{ color: 'var(--priority-highest)' }} />,
    High:    <IoArrowUp style={{ color: 'var(--priority-high)' }} />,
    Medium:  <IoRemove  style={{ color: 'var(--priority-medium)' }} />,
    Low:     <IoArrowDown style={{ color: 'var(--priority-low)' }} />,
    Lowest:  <IoArrowDown style={{ color: 'var(--priority-lowest)' }} />,
};

/* Props: issue (object), index (number), assigneeName (string | null)
   No context subscriptions — React.memo does actual work here. */
const IssueCard = memo(function IssueCard({ issue, index, assigneeName }) {
    const navigate  = useNavigate();
    const issueType = issue.type || 'Task';

    return (
        <Draggable draggableId={String(issue.id)} index={index}>
            {(provided, snapshot) => (
                <div
                    className={`issue-card ${snapshot.isDragging ? 'dragging' : ''}`}
                    onClick={() => navigate(`/issues/${issue.id}`)}
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                >
                    <div className="issue-card-header">
                        <div className={`issue-type-icon ${issueType.toLowerCase()}`}>
                            {typeIcons[issueType]}
                        </div>
                        <span className="issue-key">{issue.key || issue.pkey}</span>
                    </div>
                    <div className="issue-card-summary">{issue.summary}</div>
                    <div className="issue-card-footer">
                        <div className="issue-card-meta">
                            <span className="priority-indicator" title={issue.priority}>
                                {priorityIcons[issue.priority]}
                            </span>
                        </div>
                        {assigneeName ? (
                            <span className="assignee-name-small" title={assigneeName}>
                                {assigneeName.charAt(0).toUpperCase()}
                            </span>
                        ) : (
                            <div className="assignee-placeholder" title="Unassigned">?</div>
                        )}
                    </div>
                </div>
            )}
        </Draggable>
    );
});

export default IssueCard;
export { typeIcons, priorityIcons };
