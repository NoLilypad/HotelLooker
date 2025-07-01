import requests

# 🔑 Remplacez par votre clé API Xotelo
API_KEY = "VOTRE_API_KEY"

# 🏨 Remplacez par l'hotel_key de l'hôtel souhaité
APPOLO = "g187147-d233386"
MOULIN = "g187147-d228845"
FROCHOT = "g187147-d233570"
JOKE = "g187147-d287896"

# 📅 Dates de séjour
check_in = "2025-07-02"
check_out = "2025-07-03"


# Liste des hôtels à afficher
hotels = [
    ("APPOLO", APPOLO),
    ("MOULIN", MOULIN),
    ("FROCHOT", FROCHOT),
    ("JOKE", JOKE)
]

url = "https://data.xotelo.com/api/rates"

for hotel_name, hotel_key in hotels:
    params = {
        'hotel_key': hotel_key,
        'chk_in': check_in,
        'chk_out': check_out,
        'adults': 2,
        'currency': 'EUR',
        'rooms': 1
    }
    response = requests.get(url, params=params)
    print(f"\n=== {hotel_name} ===")
    if response.status_code == 200:
        data = response.json()
        if data.get('error'):
            print(f"Erreur API: {data['error']}")
        else:
            result = data.get('result', {})
            rates = result.get('rates', [])
            currency = result.get('currency', 'EUR')
            found = False
            for offer in rates:
                # Filtrer uniquement Booking.com
                if offer.get('name', '').lower().startswith('booking'):
                    total_price = offer.get('rate', 0) + offer.get('tax', 0)
                    print(f"OTA: {offer.get('name')}")
                    print(f"Prix de base: {offer.get('rate')} {currency}")
                    print(f"Taxes: {offer.get('tax')} {currency}")
                    print(f"Prix total: {total_price} {currency}")
                    print("-" * 40)
                    found = True
            if not found:
                print("Aucune offre Booking.com trouvée.")
    else:
        print(f"Erreur: {response.status_code}")
        print(response.text)
