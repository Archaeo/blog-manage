# pipelines/shared/git_utils.py
"""Git commit/push 유틸리티.

파이프라인 실행 후 변경된 content/ 파일을 자동 커밋하고 push한다.
"""
import subprocess
from pathlib import Path


def git_has_changes(repo_dir: Path) -> bool:
    """Git 워킹 디렉토리에 변경사항이 있는지 확인한다."""
    result = subprocess.run(
        ["git", "status", "--porcelain"],
        cwd=repo_dir,
        capture_output=True,
        text=True,
    )
    return bool(result.stdout.strip())


def git_add_and_commit(repo_dir: Path, paths: list[Path], message: str) -> bool:
    """지정된 파일을 add하고 commit한다.

    Returns:
        True if commit was made, False if nothing to commit.
    """
    str_paths = [str(p) for p in paths]
    subprocess.run(["git", "add"] + str_paths, cwd=repo_dir, check=True)

    result = subprocess.run(
        ["git", "diff", "--cached", "--quiet"],
        cwd=repo_dir,
        capture_output=True,
    )
    if result.returncode == 0:
        return False

    subprocess.run(
        ["git", "commit", "-m", message],
        cwd=repo_dir,
        check=True,
    )
    return True


def git_push(repo_dir: Path) -> None:
    """현재 브랜치를 remote에 push한다."""
    subprocess.run(["git", "push"], cwd=repo_dir, check=True)
