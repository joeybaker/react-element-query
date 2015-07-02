#!/bin/bash
# strict mode http://redsymbol.net/articles/unofficial-bash-strict-mode/
set -euo pipefail
IFS=$'\n\t'

function lint(){
  eslint --no-eslintrc --config .eslintrc "${@-.}" --ext .jsx --ext .js --ext .es6
}

function git_require_clean_work_tree(){
  git diff --exit-code
}

function find_changelog_file(){
  # find the changelog file
  local CHANGELOG=""
  if test "$CHANGELOG" = ""; then
    CHANGELOG="$(ls | egrep '^(change|history)' -i | head -n1)"
    if test "$CHANGELOG" = ""; then
      CHANGELOG="CHANGELOG.md";
    fi
  fi
  echo $CHANGELOG
}

function find_last_git_tag(){
  node -pe "a=$(npm version); 'v' + a[require('./package.json').name]"
}

# based on https://github.com/tj/git-extras/blob/master/bin/git-changelog
function generate_git_changelog(){
  GIT_LOG_OPTS="--no-merges"
  local DATE
  DATE=$(date +'%Y-%m-%d')
  local HEAD='## '

  # get the commits between the most recent tag and the second most recent
  local lasttag
  lasttag=$(find_last_git_tag)
  local version
  version=$(git describe --tags --abbrev=0 "$lasttag" 2>/dev/null)
  local previous_version
  previous_version=$(git describe --tags --abbrev=0 "$lasttag^" 2>/dev/null)
  # if we don't have a previous version to look at
  if test -z "$version"; then
    local head="$HEAD$DATE"
    local changes
    changes=$(git log $GIT_LOG_OPTS --pretty="format:* %s%n" 2>/dev/null)
  # the more common case, there's a version to git the changes betwen
  else
    local head="$HEAD$version | $DATE"
    # tail to get remove the first line, which will always just be the version commit
    # awk to remove empty lines
    local changes
    changes=$(tail -n +2 <<< "$(git log $GIT_LOG_OPTS --pretty="format:* %s%n" "$previous_version..$version" 2>/dev/null)" | awk NF)
  fi

  local CHANGELOG
  CHANGELOG=$(find_changelog_file)

  echo "Editing $CHANGELOG"
  # insert the changes after the header (assumes markdown)
  # this shells out to node b/c I couldn't figure out how to do it with awk
  local tmp_changelog=/tmp/changelog
  node -e "console.log(require('fs').readFileSync(process.argv[1]).toString().replace(/(#.*?\n\n)/, '\$1' + process.argv.slice(2).join('\n') + '\n\n'))" "$CHANGELOG" "$head" "$changes" > $tmp_changelog

  # open the changelog in the editor for editing
  ${EDITOR:-'vi'} $tmp_changelog
  mv $tmp_changelog "$CHANGELOG"
}

function git_ammend_tag(){
  local changelog_file
  local changes
  changes=$(git diff --minimal --diff-filter=M --unified=0 --color=never "$changelog_file" | grep '^\+' | egrep -v '^\+\+' | cut -c 2-)
  changelog_file="$(find_changelog_file)"

  git add "$changelog_file"
  git commit --amend --no-edit --no-verify
  git tag "$(find_last_git_tag)" -f -a -m "$changes"
}

function npm_release(){
  local access="${1-public}"
  local version="${2-patch}"

  npm version "$version" && generate_git_changelog && git_ammend_tag && npm run gitPush && npm publish --access "$access"
}
