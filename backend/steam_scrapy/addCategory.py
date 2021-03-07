import json

def addCategory():

    data = json.load(open('games.json'))
    category = json.load(open('categories.json'))
    new_file = open('games.json', "w+")

    for p in data:
        p['category'] = calcCategory(p, category)
        # print("------------------------------")
        # print(p)
        # print("------------------------------")
    json.dump(data,new_file, indent=4)

def calcCategory( game, cat ):
    nr_of_tags = [0] * len(cat)

    for i in range( len(cat) ):
        for tag in game['tags']:
            if tag in cat[i]['tags']:
                nr_of_tags[i] += 1
    # print(nr_of_tags)

    return cat[argmax(nr_of_tags)]['category']

def argmax(ary):
    maxv = ary[0]
    maxi = 0
    for p in range(len(ary)):
        if ary[p] > maxv:
            maxv = ary[p]
            maxi = p
    return maxi

def main():
    addCategory()

if __name__ == "__main__":
    main()
