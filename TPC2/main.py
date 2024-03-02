

#criar as páginas em html para as cidades

def criarFicheiros():    
    for i in range(1,101):
        open(f"Cidades/c{i}.html", "w", encoding = "utf-8")


def main():
    criarFicheiros()

main()