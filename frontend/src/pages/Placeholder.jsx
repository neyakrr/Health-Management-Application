import React from 'react';

export default function Placeholder({ title }) {
  return (
    <div>
      <h1 className="page-title">{title}</h1>
      <div className="card">
        <p>This page is under construction. Data will be populated from the MCP servers.</p>
      </div>
    </div>
  );
}
