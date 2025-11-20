import React from 'react';

function ArgumentList({ arguments: args, type, title }) {
    return (
        <div className="argument-list">
            <h3>{type === 'pro' ? 'Pros' : 'Cons'} for "{title}"</h3>
            {args.length === 0 ? (
                <p>No arguments yet.</p>
            ) : (
                <ul>
                    {args.map((arg) => (
                        <li key={arg.id} className="argument-item">
                            {arg.text}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default ArgumentList;
