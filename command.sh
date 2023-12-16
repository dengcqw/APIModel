rm Models/*
COOKIE=`cat cookie`
APICONFIG='/Users/dengjinlong/Documents/jitu/BosumMobile/src/api/Scripts/apiConfig.json'
#APICONFIG='./apiconfig.json'
/Users/dengjinlong/Documents/APIModel/bin/dev batchgenerate --cookie "$COOKIE" --config $APICONFIG --lang typescript ./Models

rc=$?; if [[ $rc != 0 ]]; then exit $rc; fi

rm /Users/dengjinlong/Documents/jitu/BosumMobile/src/api/models/*
cp Models/* /Users/dengjinlong/Documents/jitu/BosumMobile/src/api/models/
