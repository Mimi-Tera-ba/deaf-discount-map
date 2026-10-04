[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$csvPath = "raw_data.csv"
$jsPath = "data.js"

try {
    $data = Import-Csv $csvPath -Encoding UTF8
} catch {
    $data = Import-Csv $csvPath -Encoding Default
}

$facilities = @()

# 各都道府県の中心座標リスト（高速化のためのオフセット）
$prefCoords = @{
    "北海道" = @{lat=43.0620; lng=141.3543}; "青森県" = @{lat=40.8222; lng=140.7405}; "岩手県" = @{lat=39.7020; lng=141.1544}
    "宮城県" = @{lat=38.2682; lng=140.8694}; "秋田県" = @{lat=39.7165; lng=140.1023}; "山形県" = @{lat=38.2404; lng=140.3633}
    "福島県" = @{lat=37.7608; lng=140.4733}; "茨城県" = @{lat=36.3418; lng=140.4467}; "栃木県" = @{lat=36.5658; lng=139.8835}
    "群馬県" = @{lat=36.3911; lng=139.0608}; "埼玉県" = @{lat=35.8569; lng=139.6488}; "千葉県" = @{lat=35.6047; lng=140.1233}
    "東京都" = @{lat=35.6894; lng=139.6917}; "神奈川県" = @{lat=35.4477; lng=139.6425}; "新潟県" = @{lat=37.9022; lng=139.0236}
    "富山県" = @{lat=36.6952; lng=137.2113}; "石川県" = @{lat=36.5946; lng=136.6255}; "福井県" = @{lat=36.0640; lng=136.2219}
    "山梨県" = @{lat=35.6638; lng=138.5683}; "長野県" = @{lat=36.6512; lng=138.1812}; "岐阜県" = @{lat=35.4232; lng=136.7606}
    "静岡県" = @{lat=34.9769; lng=138.3830}; "愛知県" = @{lat=35.1814; lng=136.9064}; "三重県" = @{lat=34.7302; lng=136.5085}
    "滋賀県" = @{lat=35.0045; lng=135.8685}; "京都府" = @{lat=35.0210; lng=135.7556}; "大阪府" = @{lat=34.6937; lng=135.5022}
    "兵庫県" = @{lat=34.6912; lng=135.1830}; "奈良県" = @{lat=34.6850; lng=135.8050}; "和歌山県" = @{lat=34.2260; lng=135.1675}
    "鳥取県" = @{lat=35.5011; lng=134.2350}; "島根県" = @{lat=35.4722; lng=133.0505}; "岡山県" = @{lat=34.6617; lng=133.9350}
    "広島県" = @{lat=34.3963; lng=132.4594}; "山口県" = @{lat=34.1858; lng=131.4713}; "徳島県" = @{lat=34.0657; lng=134.5593}
    "香川県" = @{lat=34.3401; lng=134.0434}; "愛媛県" = @{lat=33.8416; lng=132.7661}; "高知県" = @{lat=33.5597; lng=133.5311}
    "福岡県" = @{lat=33.6063; lng=130.4180}; "佐賀県" = @{lat=33.2494; lng=130.2998}; "長崎県" = @{lat=32.7503; lng=129.8777}
    "熊本県" = @{lat=32.7898; lng=130.7416}; "大分県" = @{lat=33.2381; lng=131.6126}; "宮崎県" = @{lat=31.9110; lng=131.4238}
    "鹿児島県" = @{lat=31.5601; lng=130.5580}; "沖縄県" = @{lat=26.2124; lng=127.6809}
}

foreach ($row in $data) {
    $pref = $row.'都道府県'
    $address = $row.'住所または運行エリア'
    
    $lat = $null
    $lng = $null
    
    # 事前定義の都道府県座標を利用して爆速で処理する
    if ($prefCoords.ContainsKey($pref)) {
        # 同じ県内で適度にランダムに散らす (±約20km範囲)
        $lat = $prefCoords[$pref].lat + ((Get-Random -Minimum -20 -Maximum 20) / 100.0)
        $lng = $prefCoords[$pref].lng + ((Get-Random -Minimum -20 -Maximum 20) / 100.0)
    } else {
        $lat = 35.681236 + ((Get-Random -Minimum -20 -Maximum 20) / 100.0)
        $lng = 139.767125 + ((Get-Random -Minimum -20 -Maximum 20) / 100.0)
    }
    
    $facilities += @{
        genre = $row.'ジャンル'
        name = $row.'施設・サービス名'
        pref = $pref
        address = $address
        discount = $row.'割引内容'
        url = if ($null -eq $row.'公式サイトURL') { "" } else { $row.'公式サイトURL' }
        lat = $lat
        lng = $lng
    }
}

$json = $facilities | ConvertTo-Json -Depth 5 -Compress
Set-Content -Path $jsPath -Value "const facilitiesData = $json;" -Encoding UTF8
