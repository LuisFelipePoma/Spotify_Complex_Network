import os


# Read the jsons in the file "data" to rename

data = os.listdir("datasets/data")

# Rename each file
for i,file in enumerate(data):
    os.rename("datasets/data/"+file, "datasets/data/"+str(i)+".json")