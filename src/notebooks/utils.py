import networkx as nx
import networkit as nk
import matplotlib.pyplot as plt


# plot powerlaw of the graph
def plot_powerlaw(G) -> None:
    # graph powerlaw with adapter
    hist = nx.degree_histogram(nk.nxadapter.nk2nx(nkG=G))

    plt.plot(range(0, len(hist)), hist, ".")  # type: ignore
    plt.title("Degree Distribution")
    plt.xlabel("Degree")
    plt.ylabel("#Nodes")
    plt.loglog()
    plt.show()


# show metrics of the weight
def show_weight(G: nx.Graph | nk.Graph):
    # Validate input
    if not isinstance(G, nx.Graph) and not isinstance(G, nk.Graph):
        raise ValueError("G must be a networkx or networkit graph")

    # Convert to networkx graph
    if isinstance(G, nk.Graph):
        g = nk.nxadapter.nk2nx(G)
    else:
        g = G

    # Calculate max,min,average weight
    max_weight = 0
    min_weight = float("inf")

    total_weight = 0
    for u, v in g.edges():
        weight = g[u][v]["weight"]
        total_weight += weight
        max_weight = max(max_weight, weight)
        min_weight = min(min_weight, weight)
    # print values of weight
    print(f"Max Weight: {max_weight}")
    print(f"Min Weight: {min_weight}")
    print(f"Average Weight: {total_weight / g.number_of_edges()}")

# get the artist name from the dict
def get_artist_name(node, artists):
    return list(artists.keys())[list(artists.values()).index(node)]