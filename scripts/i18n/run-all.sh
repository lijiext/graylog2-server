#!/usr/bin/env bash
# Graylog 中文本地化流水线入口
# 前置：已建 6.1.16-zh 分支、已装脚本依赖（npm install 在 scripts/i18n 下）
#
# 典型用法：
#   bash run-all.sh extract       # 前后端抽取
#   bash run-all.sh extract-dyn   # 动态模板字面量抽取
#   bash run-all.sh translate-fe  # 前端翻译（后台挂，约 4-5 小时）
#   bash run-all.sh translate-be  # 后端翻译（小，约 20 分钟）
#   bash run-all.sh translate-ftl # FreeMarker 模板翻译
#   bash run-all.sh translate-dyn # 动态模板翻译（约 5 分钟）
#   bash run-all.sh apply         # 前后端回写
#   bash run-all.sh apply-dyn     # 动态模板回写
#   bash run-all.sh status        # 查看进度
#   bash run-all.sh build         # 构建镜像

set -e
CMD="${1:-status}"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$SCRIPT_DIR"

LOG_FE="/tmp/i18n-translate.log"
LOG_BE="/tmp/i18n-translate-be.log"
LOG_FTL="/tmp/i18n-translate-ftl.log"

case "$CMD" in
  extract)
    echo "[run-all] frontend extract..."
    node extract.mjs
    echo "[run-all] backend extract..."
    node extract-backend.mjs
    ;;

  translate-fe)
    echo "[run-all] starting frontend translation in background → $LOG_FE"
    echo "[run-all] ETA ~4-5h (2386 strings ÷ 20/batch × ~135s)"
    nohup node translate.mjs > "$LOG_FE" 2>&1 &
    echo "  PID=$!"
    ;;

  translate-be)
    echo "[run-all] starting backend translation..."
    nohup node translate.mjs \
      --input i18n/strings-backend.json \
      --output i18n/translations-backend.json \
      > "$LOG_BE" 2>&1 &
    echo "  PID=$!"
    ;;

  translate-ftl)
    echo "[run-all] FreeMarker translation (78 files × ~30s each, ~40min)..."
    nohup node translate-ftl.mjs > "$LOG_FTL" 2>&1 &
    echo "  PID=$!"
    ;;

  extract-dyn)
    echo "[run-all] dynamic template extract..."
    node extract-dynamic.mjs
    ;;

  translate-dyn)
    echo "[run-all] translating dynamic shapes (concurrent)..."
    I18N_CONCURRENCY="${I18N_CONCURRENCY:-8}" node translate-dynamic.mjs
    ;;

  apply-dyn)
    echo "[run-all] apply dynamic translations..."
    node apply-dynamic.mjs
    ;;

  apply)
    echo "[run-all] apply frontend..."
    node apply.mjs
    echo "[run-all] apply backend..."
    if [ -f "$REPO_ROOT/i18n/translations-backend.json" ]; then
      node apply-backend.mjs
    else
      echo "  (skip: translations-backend.json not found)"
    fi
    ;;

  status)
    echo "=== i18n-zh status ==="
    echo
    echo "-- git branch --"
    git -C "$REPO_ROOT" branch --show-current 2>/dev/null || echo "(not a git repo)"
    echo
    echo "-- frontend strings --"
    if [ -f "$REPO_ROOT/i18n/strings.json" ]; then
      node -e "const d=require('$REPO_ROOT/i18n/strings.json'); console.log('  unique:', d.totalUnique, 'occurrences:', d.totalOccurrences, 'dynamics:', d.dynamicCount);"
    else
      echo "  (not extracted yet)"
    fi
    echo "-- frontend translations --"
    if [ -f "$REPO_ROOT/i18n/translations.json" ]; then
      node -e "const d=require('$REPO_ROOT/i18n/translations.json'); console.log('  cached:', Object.keys(d.translations).length, '/', 'failures:', (d.failures||[]).length);"
    else
      echo "  (none yet)"
    fi
    echo "-- backend strings --"
    if [ -f "$REPO_ROOT/i18n/strings-backend.json" ]; then
      node -e "const d=require('$REPO_ROOT/i18n/strings-backend.json'); console.log('  unique:', d.totalUnique);"
    else
      echo "  (not extracted)"
    fi
    echo "-- backend translations --"
    if [ -f "$REPO_ROOT/i18n/translations-backend.json" ]; then
      node -e "const d=require('$REPO_ROOT/i18n/translations-backend.json'); console.log('  cached:', Object.keys(d.translations).length);"
    else
      echo "  (none yet)"
    fi
    echo "-- ftl --"
    if [ -f "$REPO_ROOT/i18n/ftl-files.json" ]; then
      node -e "const d=require('$REPO_ROOT/i18n/ftl-files.json'); console.log('  total:', d.total, 'with english:', d.withEnglish);"
    fi
    echo
    echo "-- background logs (last line) --"
    for L in "$LOG_FE" "$LOG_BE" "$LOG_FTL"; do
      if [ -f "$L" ]; then
        printf "  %s → %s\n" "$(basename $L)" "$(tail -1 $L)"
      fi
    done
    echo
    echo "-- running processes --"
    ps -ef | grep -E 'translate(\.mjs|-ftl)' | grep -v grep | awk '{print "  PID", $2, $8, $9, $10}'
    ;;

  kill)
    echo "[run-all] killing all translate processes..."
    ps -ef | grep -E 'translate(\.mjs|-ftl)|gemini' | grep -v grep | awk '{print $2}' | xargs -r kill -9
    echo "  done"
    ;;

  build)
    echo "[run-all] building graylog jar (skip tests)..."
    cd "$REPO_ROOT"
    ./mvnw -pl graylog2-server -am clean package -DskipTests -Dmaven.javadoc.skip=true
    ;;

  *)
    echo "Unknown command: $CMD"
    echo "Usage: $0 {extract|translate-fe|translate-be|translate-ftl|apply|status|kill|build}"
    exit 1
    ;;
esac
