import xml.etree.ElementTree as ET
import os

listaRuas = ["Rua do Campo", "Travessa Da Rua Do Forno Para A Do Poco"]

listaFicheiros = ["MapaRuas-materialBase/texto/MRB-01-RuaDoCampo.xml", "MapaRuas-materialBase/texto/MRB-12-TravessaDaRuaDoFornoParaADoPoco.xml"]
html = '''

<!DOCTYPE html>
<html>
<head>
    <title>TPC1</title>
    <meta charset="UTF-8">
</head>
<body>

'''


def paginaInicial(html, listaRuas):
    html += "<ul>"
    for rua in listaRuas:
        html += f'<li><a href="Ruas/{rua}.html">{rua}</a></li>'

    html += "</ul>"
    
    html += "</body>"
    html += "</html>"
    
    file = open("mapaRuas.html", "w", encoding="utf-8")
    file.write(html)
    file.close()
    

template = html


def paginaRua(nomeRua, imagens, legendas, descricao, casas):
    titulo = f'''
        <!DOCTYPE html>
        <html>
        <head>
            <title>TPC1</title>
            <meta charset="UTF-8">
        </head>
        <body>
            <h1>{nomeRua}</h1>
        </body>
        </html>
    '''
    pagina = titulo
    
    imagem  = """
            <div class="flex text-4xl font-bold space-x-6">
                <i class="bi bi-image-fill text-blue-500"></i>
                <p><h2>Galeria</h2></p>
            </div>
            <div>
    """

    for i in range(0, len(imagens)):
        figura = "MapaRuas-materialBase/imagem/" + imagens[i]
        figuraATual = "MapaRuas-materialBase/atual/" + imagens[i]
        imagem += f"""
                <h4>Rua antigamente</h4>
                <img src="{figura}" class="w-full rounded-lg"/>
                <figcaption>{legendas[i]}</figcaption>
                <h4>Rua atualmente</h4>
                
                <img src="{figuraATual}" class="w-full rounded-lg"/>
                <figcaption>{legendas[i]}</figcaption>
        """
    
    imagem += "\t\t</div>"
    pagina += imagem
    
    imagem1 = f'''
        <img> src="{'imagem1.jpg'}"</img>
    '''
    
    pagina += imagem1
    descricao = f'''
        </div>
            <div class="text-justify">
                {descricao}
        </div>
    '''
    
    pagina += descricao
    
    casa = f'''
        <h2>Edifícios presentes nesta rua:</h2>
    '''
    for numero, informacao in casas.items():
        casa += f'''
                <h4>Numero da casa: {numero}</h4>
                 <li>Enfiteuta: "{informacao["enfiteuta"]}</li>    
                 <li>Foro: "{informacao["foro"]}</li>
                 <li>Descrição: {informacao["descricao"]}</li>
        '''
    
    pagina += casa

    #aquime meto a informação da rua na sua devida página
    fileRua = open(f"Ruas/{nomeRua}.html", "w", encoding = "utf-8")
    fileRua.write(pagina)
    fileRua.close()

def obterDescricao(texto):
    descricao = ""
    for p in texto:
        if p.itertext() is not None:
            descricao += "<p class='mb-2'>"
            descricao += ''.join(p.itertext())
            descricao += "</p>"
    return descricao

def parserXML(ficheiro):
    imagens = []
    legendas = []
    root = ET.parse(ficheiro).getroot()
    
    nomeRua = root.find("meta").find("nome").text
    for figura in root.find("corpo").findall("figura"):
        caminho = figura.find("imagem").attrib["path"].split("/")[2]  # Corrigindo o acesso ao atributo
        imagens.append(caminho)
        legenda = figura.find("legenda").text  # Corrigindo a tag "lengenda" para "legenda"
        legendas.append(legenda)
    
    #obtem o texto todo da rua meto já como deve estar em html para ter os parágrafos   
    descricao = obterDescricao(root.find('corpo').findall('para'))
    casas = {}
    lista_casas = root.find("corpo").find("lista-casas")

    # Verifica se a seção <lista-casas> foi encontrada
    if lista_casas is not None:
        for casa in lista_casas.findall("casa"):
            numero = casa.find("número").text
            casas[numero] = {}
            enfiteuta_element = casa.find("enfiteuta")
            if enfiteuta_element is not None:
                enfiteuta = enfiteuta_element.text
            else:
                enfiteuta = None
            foroAux = casa.find("foro")
            if foroAux is not None:
                foro = foroAux.text
            else:
                foro = None
            descricaoCasa = casa.find("desc").find("para")
            descricaoCasaAux = casa.find("foro")
            if descricaoCasaAux is not None:
                descricaoCasa = descricaoCasaAux.text
            else:
                descricaoCasa = None
            casas[numero]["enfiteuta"] = enfiteuta
            casas[numero]["foro"] = foro
            casas[numero]["descricao"] = descricaoCasa
    return (nomeRua, imagens, legendas, descricao, casas)
        
def main():
    paginaInicial(html, listaRuas)
    for ficheiro in listaFicheiros:
        (nomeRua, imagens, legendas, descricao, casas) = parserXML(ficheiro)        
        paginaRua(nomeRua, imagens, legendas, descricao, casas)
main()
    
