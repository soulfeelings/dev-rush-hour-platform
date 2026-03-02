CREATE TABLE project_infrastructures (
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    infrastructure_id UUID NOT NULL REFERENCES infrastructures(id) ON DELETE CASCADE,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (project_id, infrastructure_id)
);

CREATE INDEX idx_project_infrastructures_project_id ON project_infrastructures(project_id);
CREATE INDEX idx_project_infrastructures_infrastructure_id ON project_infrastructures(infrastructure_id);
