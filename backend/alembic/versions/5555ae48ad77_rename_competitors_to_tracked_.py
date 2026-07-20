"""rename_competitors_to_tracked_organizations

Revision ID: 5555ae48ad77
Revises: 25e32419477a
Create Date: 2026-07-20 01:35:18.695480

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '5555ae48ad77'
down_revision: Union[str, None] = '25e32419477a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.alter_column('business_entities', 'competitors', new_column_name='tracked_organizations')

def downgrade() -> None:
    op.alter_column('business_entities', 'tracked_organizations', new_column_name='competitors')
