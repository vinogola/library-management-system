#!/usr/bin/env bash
# Checks GET, POST, PATCH and DELETE on /genres against docs/edge-cases.md.
# (GET rows 6 and 7, DB down, are manual: stop the database and curl.)
# G5, P6 and D5 expect 500: a known gap (ids too big for INT4). Change them to 400 when the id pipe is added.
# Usage: BOOKS_ID=1 bash docs/curl-genres.sh
# BOOKS_ID = a seeded genre that has books (check with: curl localhost:3000/genres)
BASE=${BASE:-http://localhost:3000}
BOOKS_ID=${BOOKS_ID:-1}
J='Content-Type: application/json'

# check LABEL EXPECTED METHOD PATH [BODY]
check() {
  local label=$1 want=$2 method=$3 path=$4 body=$5 got
  if [ -n "$body" ]; then
    got=$(curl -s -o /dev/null -w '%{http_code}' -X "$method" "$BASE$path" -H "$J" -d "$body")
  else
    got=$(curl -s -o /dev/null -w '%{http_code}' -X "$method" "$BASE$path")
  fi
  [ "$got" = "$want" ] && r=OK || r=MISMATCH
  printf '%-9s %-34s want %s  got %s\n' "$r" "$label" "$want" "$got"
}

# Setup: two throwaway genres (PATCH target and DELETE target)
curl -s -X POST "$BASE/genres" -H "$J" -d '{"name":"Tmp A","slug":"tmp-a"}' > /tmp/tmp_a.json
curl -s -X POST "$BASE/genres" -H "$J" -d '{"name":"Tmp B","slug":"tmp-b"}' > /tmp/tmp_b.json
A=$(grep -o '"id":[0-9]*' /tmp/tmp_a.json | cut -d: -f2)
B=$(grep -o '"id":[0-9]*' /tmp/tmp_b.json | cut -d: -f2)
echo "PATCH target id=$A, DELETE target id=$B, genre with books id=$BOOKS_ID"
echo "(re-runs: delete Tmp A / Tmp B / Tmp C first or the setup POSTs return 409)"
echo

echo "--- GET /:id ---"
check "G1 exists"                200 GET "/genres/$BOOKS_ID"
check "G2 no such row"           404 GET "/genres/9999"
check "G3 -5"                    404 GET "/genres/-5"
check "G3 0"                     404 GET "/genres/0"
check "G4 abc"                   400 GET "/genres/abc"
check "G4 1.5"                   400 GET "/genres/1.5"
check "G5 huge id"               500 GET "/genres/99999999999"
echo

echo "--- POST ---"
got=$(curl -s -o /tmp/tmp_c.json -w '%{http_code}' -X POST "$BASE/genres" -H "$J" -d '{"name":"Tmp C","slug":"tmp-c"}')
[ "$got" = "201" ] && r=OK || r=MISMATCH
printf '%-9s %-34s want %s  got %s\n' "$r" "O1 all valid" 201 "$got"
C=$(grep -o '"id":[0-9]*' /tmp/tmp_c.json | cut -d: -f2)
check "O2 slug missing"          400 POST "/genres" '{"name":"No Slug"}'
check "O2 empty body"            400 POST "/genres" '{}'
check "O3 name is a number"      400 POST "/genres" '{"name":99,"slug":"num"}'
check "O4 empty name"            400 POST "/genres" '{"name":"","slug":"empty-name"}'
check "O5 id in body"            400 POST "/genres" '{"id":3,"name":"With Id","slug":"with-id"}'
check "O6 duplicate name"        409 POST "/genres" '{"name":"Tmp A","slug":"unique-slug"}'
check "O7 duplicate slug"        409 POST "/genres" '{"name":"Unique Name","slug":"tmp-a"}'
echo

echo "--- PATCH ---"
check "P1 valid name"            200 PATCH "/genres/$A" '{"name":"Tmp A2"}'
check "P2 empty body"            200 PATCH "/genres/$A" '{}'
check "P3 no id"                 404 PATCH "/genres/"   '{"name":"X"}'
check "P4 abc"                   400 PATCH "/genres/abc" '{"name":"X"}'
check "P4 1.5"                   400 PATCH "/genres/1.5" '{"name":"X"}'
check "P5 -78"                   404 PATCH "/genres/-78" '{"name":"X"}'
check "P5 999"                   404 PATCH "/genres/999" '{"name":"X"}'
check "P6 huge id"               500 PATCH "/genres/99999999999" '{"name":"X"}'
check "P7 name is a number"      400 PATCH "/genres/$A" '{"name":99}'
check "P8 id in body"            400 PATCH "/genres/$A" '{"id":3}'
check "P9 malformed JSON"        400 PATCH "/genres/$A" '{name:X'
check "P10 duplicate name"       409 PATCH "/genres/$A" "{\"name\":\"Tmp B\"}"
check "P10 duplicate slug"       409 PATCH "/genres/$A" '{"slug":"tmp-b"}'
check "P11 empty name"           400 PATCH "/genres/$A" '{"name":""}'
echo

echo "--- DELETE ---"
check "D2 no id"                 404 DELETE "/genres/"
check "D3 abc"                   400 DELETE "/genres/abc"
check "D3 1.5"                   400 DELETE "/genres/1.5"
check "D4 -78"                   404 DELETE "/genres/-78"
check "D4 999"                   404 DELETE "/genres/999"
check "D5 huge id"               500 DELETE "/genres/99999999999"
check "D6 genre with books"      409 DELETE "/genres/$BOOKS_ID"
check "D1 genre without books"   200 DELETE "/genres/$B"
check "D4 again (already gone)"  404 DELETE "/genres/$B"
echo
check "cleanup Tmp C"            200 DELETE "/genres/$C"
echo
echo "Cleanup: delete Tmp A -> curl -X DELETE $BASE/genres/$A"
