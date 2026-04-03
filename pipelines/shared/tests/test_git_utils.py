# pipelines/shared/tests/test_git_utils.py
"""Git 유틸 테스트 (실제 git repo 사용)."""
import subprocess
import tempfile
from pathlib import Path

import pytest
from pipelines.shared.git_utils import git_has_changes, git_add_and_commit


@pytest.fixture
def git_repo():
    """임시 Git 저장소를 생성한다."""
    with tempfile.TemporaryDirectory() as tmpdir:
        repo = Path(tmpdir)
        subprocess.run(["git", "init"], cwd=repo, capture_output=True)
        subprocess.run(["git", "config", "user.email", "test@test.com"], cwd=repo, capture_output=True)
        subprocess.run(["git", "config", "user.name", "Test"], cwd=repo, capture_output=True)
        (repo / "README.md").write_text("init")
        subprocess.run(["git", "add", "."], cwd=repo, capture_output=True)
        subprocess.run(["git", "commit", "-m", "init"], cwd=repo, capture_output=True)
        yield repo


def test_변경없으면_false(git_repo):
    assert git_has_changes(git_repo) is False


def test_변경있으면_true(git_repo):
    (git_repo / "new.txt").write_text("hello")
    assert git_has_changes(git_repo) is True


def test_커밋_성공(git_repo):
    new_file = git_repo / "test.txt"
    new_file.write_text("content")
    result = git_add_and_commit(git_repo, [new_file], "테스트 커밋")
    assert result is True
    assert git_has_changes(git_repo) is False


def test_변경없으면_커밋안함(git_repo):
    result = git_add_and_commit(git_repo, [git_repo / "README.md"], "빈 커밋")
    assert result is False
