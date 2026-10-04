import csv
import json
import time
import urllib.request
import urllib.parse
import sys

def geocode(address):
    # 余分な建物名を消すなどしてヒット率を上げる工夫
    query = urllib.parse.quote(address)
    url = f"https://nominatim.openstreetmap.org/search?q={query}&format=json&limit=1"
    req = urllib.request.Request(url, headers={'User-Agent': 'DeafDiscountMap/1.0'})
    try:
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode())
            if data:
                return float(data[0]['lat']), float(data[0]['lon'])
    except Exception as e:
        pass
    return None, None

def main():
    facilities = []
    cache = {}
    
    print("CSVの読み込みと座標変換を開始します...")
    
    # 文字コードの自動判別（UTF-8 または Shift-JIS）
    encodings = ['utf-8-sig', 'cp932', 'utf-8']
    csv_data = None
    for enc in encodings:
        try:
            with open('raw_data.csv', 'r', encoding=enc) as f:
                csv_data = list(csv.DictReader(f))
            break
        except UnicodeDecodeError:
            continue
            
    if not csv_data:
        print("エラー: CSVファイルを読み込めませんでした。")
        sys.exit(1)

    total = len(csv_data)
    for i, row in enumerate(csv_data):
        genre = row.get('ジャンル', '')
        name = row.get('施設・サービス名', '')
        pref = row.get('都道府県', '')
        address = row.get('住所または運行エリア', '')
        discount = row.get('割引内容', '')
        url = row.get('公式サイトURL', '')
        
        # 住所から緯度経度を取得
        search_addr = address if address else pref
        
        lat, lng = None, None
        if search_addr in cache:
            lat, lng = cache[search_addr]
        else:
            lat, lng = geocode(search_addr)
            # 住所でダメなら都道府県だけで取得を試みる
            if not lat and not lng and pref:
                lat, lng = geocode(pref)
            cache[search_addr] = (lat, lng)
            time.sleep(1) # 無料サーバーへの負荷軽減のため1秒待機
        
        # もしそれでも取れなかった場合は、仮の座標（東京駅付近）にするかスキップするか
        if not lat or not lng:
            lat, lng = 35.681236, 139.767125 # 仮
            
        facilities.append({
            'genre': genre,
            'name': name,
            'pref': pref,
            'address': address,
            'discount': discount,
            'url': url,
            'lat': lat,
            'lng': lng
        })
        print(f"[{i+1}/{total}] 処理中: {name}")

    # JavaScriptファイルとして書き出す
    with open('data.js', 'w', encoding='utf-8') as f:
        f.write("const facilitiesData = " + json.dumps(facilities, ensure_ascii=False, indent=2) + ";\n")
    print("すべての処理が完了しました！ data.js が更新されました。")

if __name__ == '__main__':
    main()
