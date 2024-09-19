# http://rap.jms.com:8080/repository/get?id=342
#let apis = []; moduls.forEach(e => apis = [...apis, ...e.interfaces]);
#let apiObj = {}; moduls.forEach(e => e.interfaces.forEach(e => apiObj[e.id] = e))
rm Models/*
COOKIE=`cat cookie`
#APICONFIG='/Users/dengjinlong/Documents/jitu/BosumMobile/src/api/Scripts/apiConfig.json'
APICONFIG='./apiconfig.json'
#APIModel batchgenerate --cookie "$COOKIE" --config $APICONFIG --lang dart ./Models
APIModel batchgenerate --cookie "$COOKIE" --config $APICONFIG --lang typescript ./Models

rc=$?; if [[ $rc != 0 ]]; then exit $rc; fi

#rm /Users/dengjinlong/Documents/jitu/BosumMobile/src/api/models/*
#cp Models/* /Users/dengjinlong/Documents/jitu/BosumMobile/src/api/models/
