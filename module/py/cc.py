# 获取网易CC的真实流媒体地址。
# 默认为最高画质


import requests
import argparse


def get_real_url(rid):
    room_url = 'https://api.cc.163.com/v1/activitylives/anchor/lives?anchor_ccid=' + str(rid)
    response = requests.get(url=room_url).json()
    data = response.get('data', 0)
    if data:
        channel_id = data.get('{}'.format(rid)).get('channel_id', 0)
        if channel_id:
            response = requests.get('https://cc.163.com/live/channel/?channelids=' + str(channel_id)).json()
            real_url = response.get('data')[0].get('sharefile')
        else:
            real_url = '直播间不存在'
    else:
        real_url = '输入错误'
    return real_url

parser = argparse.ArgumentParser()
parser.add_argument('--room',type=int)
args = parser.parse_args()

real_url = get_real_url(args.room)

print(real_url)