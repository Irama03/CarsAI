from flask import Flask
from flask import request
from flask_cors import CORS

from dataset import torch, os, transforms, np, get_class, num_classes, m, s

from torch.autograd import Variable
from torchvision.models import resnet

from PIL import Image

from config import *

classes = {"num_classes": len(num_classes)}

mean=m
std_dev=s

transform = transforms.Compose([transforms.Resize((224,224)),
                                    transforms.ToTensor(),
                                    transforms.Normalize(mean, std_dev)])

resnet152_model = resnet.resnet152(pretrained=False, **classes)
model_name="resnet152"
model=resnet152_model


avg_score_file_path = 'average_score.txt'

app = Flask(__name__)
cors = CORS(app)

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
    # car_image = Image.open(request.files['car_image'].stream).convert("RGB")
    request.files['car_image'].save(os.path.join(app.root_path, 'file.jpg'))
    return getCarMarkFromImage()


def getCarMarkFromImage():
    print(str(RESULTS_PATH) + "/" + str(model_name) + "/" + str(model_name) + ".pt")

    model.load_state_dict(torch.load(str(RESULTS_PATH) + "/" + str(model_name) + "/" + str(model_name) + ".pt"))

    im = Image.open(os.path.join(app.root_path, 'file.jpg')).convert("RGB")
    im = transform(im)
    x = Variable(im.unsqueeze(0))

    pred = model(x).data.numpy().copy()

    idx_max_pred = np.argmax(pred)
    idx_classes = idx_max_pred % classes["num_classes"]
    
    return { "mark": get_class(idx_classes) }