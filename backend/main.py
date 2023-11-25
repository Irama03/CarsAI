from flask import Flask
from flask import request

avg_score_file_path = 'average_score.txt'

app = Flask(__name__)

def parse_file():
    with open(avg_score_file_path, 'r') as file:
        arr = file.read().split(' ')
        if (len(arr) < 2):
            return (0, 0)
        return (float(arr[0]), float(arr[1]))

@app.route("/rate", methods=["POST", "GET"])
def rate():
    if (request.method == "GET"):
        (currSum, currAmountOfCounters) = parse_file()
        return {
            "average": round(currSum / (currAmountOfCounters if currAmountOfCounters > 0 else 1), 2)
        }

    rating = request.get_json()["rating"]
    if not isinstance(rating, (int, float)) or rating < 1 or rating > 5:
        return "Invalid rating", 400
    
    (currSum, currAmountOfCounters) = parse_file()

    newSum = currSum + rating
    newAmountOfCounters = currAmountOfCounters + 1
    
    with open(avg_score_file_path, 'w') as file:
        file.write(str(newSum) + ' ' + str(newAmountOfCounters))

    return {
        "average": round(newSum / newAmountOfCounters, 2)
    }

@app.route("/result", methods=["POST"])
def getResult():
    car_image = request.files['car_image']
    return getCarMarkFromImage(car_image)


def getCarMarkFromImage(car_image):
    return { "mark": "BMW" }