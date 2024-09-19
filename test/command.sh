# http://rap.jms.com:8080/repository/get?id=342
#let apis = []; moduls.forEach(e => apis = [...apis, ...e.interfaces]);
#let apiObj = {}; moduls.forEach(e => e.interfaces.forEach(e => apiObj[e.id] = e))

rm Models/*

#COOKIE=`cat cookie`
#APICONFIG='./apiconfig.json'
#APIModel generate --cookie "$COOKIE" --config $APICONFIG --lang typescript ./Models

# 使用默认值
APIModel generate ./Models

rc=$?; if [[ $rc != 0 ]]; then exit $rc; fi
