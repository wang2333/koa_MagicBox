# 获取战旗直播（战旗TV）的真实流媒体地址。
# 默认画质为超清


import requests
import argparse


def get_real_url(rid):
    room_url = 'https://m.zhanqi.tv/api/static/v2.1/room/domain/' + str(rid) + '.json'
    try:
        response = requests.get(url=room_url).json()
        videoId = response.get('data').get('videoId')
        if videoId:
            real_url = 'https://dlhdl-cdn.zhanqi.tv/zqlive/' + str(videoId) + '.flv'
        else:
            real_url = '未开播'
    except:
        real_url = '直播间不存在'
    return real_url


parser = argparse.ArgumentParser()
parser.add_argument('--room',type=int)
args = parser.parse_args()
real_url = get_real_url(args.room)
print(real_url)