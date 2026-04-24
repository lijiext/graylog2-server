#!/usr/bin/env bash
# Graylog 中文本地化流水线入口
# 前置：已建 6.1.16-zh 分支、已装脚本依赖（npm install 在 scripts/i18n 下）
#
# 典型用法：
#   bash run-all.sh extract-all       # 所有抽取轨道（前端 + 后端 + 动态 + ternary + const）
#   bash run-all.sh translate-fe      # 前端静态翻译
#   bash run-all.sh translate-be      # 后端 Java 翻译
#   bash run-all.sh translate-ftl     # FreeMarker 翻译
#   bash run-all.sh translate-dyn     # 动态模板翻译
#   bash run-all.sh translate-ternary # ternary 分支翻译
#   bash run-all.sh translate-const   # const/ObjectProperty 翻译
#   bash run-all.sh apply-all         # 所有回写
#   bash run-all.sh status            # 查看进度
#   bash run-all.sh build             # 构建镜像
#
# 单独命令（按需）：
#   extract extract-dyn extract-ternary extract-const extract-backend*
#   apply apply-dyn apply-ternary apply-const apply-backend*
#   (*extract-backend 与 apply-backend 来自 extract.mjs / apply-backend.mjs；由 extract/translate-be/apply 主命令触发)

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

  extract-ternary)
    echo "[run-all] ternary branch extract..."
    node extract-ternary.mjs
    ;;

  translate-ternary)
    echo "[run-all] translate ternary..."
    I18N_CONCURRENCY="${I18N_CONCURRENCY:-8}" node translate.mjs \
      --input i18n/strings-ternary.json \
      --output i18n/translations-ternary.json
    ;;

  apply-ternary)
    echo "[run-all] apply ternary translations..."
    node apply-ternary.mjs
    ;;

  extract-const)
    echo "[run-all] const/ObjectProperty extract..."
    node extract-const.mjs
    ;;

  translate-const)
    echo "[run-all] translate const strings..."
    I18N_CONCURRENCY="${I18N_CONCURRENCY:-8}" node translate.mjs \
      --input i18n/strings-const.json \
      --output i18n/translations-const.json
    ;;

  apply-const)
    echo "[run-all] apply const translations..."
    node apply-const.mjs
    ;;

  extract-all)
    echo "[run-all] full extract (all tracks)..."
    node extract.mjs
    node extract-dynamic.mjs
    node extract-ternary.mjs
    node extract-const.mjs
    node extract-backend.mjs
    ;;

  apply-all)
    echo "[run-all] full apply (all tracks)..."
    node apply.mjs
    node apply-dynamic.mjs
    node apply-ternary.mjs
    node apply-const.mjs
    if [ -f "$REPO_ROOT/i18n/translations-backend.json" ]; then
      node apply-backend.mjs
    fi
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
