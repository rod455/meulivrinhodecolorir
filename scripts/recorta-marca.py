# Recorta, das pranchas do kit de marca, os ícones dos passos e as poses do
# Rabisco que não vieram como arquivo separado, com fundo transparente.
# Uso: python3 -I scripts/recorta-marca.py <pasta do kit> <pasta qualquer>
import sys
from PIL import Image, ImageDraw, ImageFilter
K,S=sys.argv[1],sys.argv[2]
def transparente(im, tol=28):
    im=im.convert('RGB'); w,h=im.size
    mask=Image.new('L',(w,h),0)
    # pinta de 255 o fundo conectado às bordas, por preenchimento a partir de vários pontos da borda
    marc=im.copy()
    for x,y in [(0,0),(w-1,0),(0,h-1),(w-1,h-1),(w//2,0),(w//2,h-1),(0,h//2),(w-1,h//2)]:
        ImageDraw.floodfill(marc,(x,y),(255,0,255),thresh=tol)
    px=marc.load(); m=mask.load()
    for y in range(h):
        for x in range(w):
            if px[x,y]==(255,0,255): m[x,y]=255
    alpha=Image.eval(mask.filter(ImageFilter.GaussianBlur(0.8)),lambda v:255-v)
    out=im.convert('RGBA'); out.putalpha(alpha); return out.crop(out.getbbox())
def corta(src,box,dst,larg,apaga=None):
    base=Image.open(f'{K}/{src}').convert('RGB')
    if apaga: ImageDraw.Draw(base).rectangle(apaga,fill=base.getpixel((apaga[0],apaga[1]-30)))
    im=transparente(base.crop(box))
    if im.width>larg: im=im.resize((larg,round(im.height*larg/im.width)),Image.LANCZOS)
    im.save(dst,'WEBP',quality=90,method=6); print(dst,im.size)
A='referencia/aplicacoes-da-marca.png'; P='referencia/prancha-aprovada.png'
corta(A,(125,535,250,606),'public/marca/icone-escolha.webp',240)
corta(A,(385,532,492,606),'public/marca/icone-personalize.webp',240)
corta(A,(1249,716,1309,784),'public/marca/icone-imprima.webp',240)
corta(P,(990,70,1292,452),'public/marca/rabisco-desenhando.webp',400,apaga=(985,80,1045,330))
corta(P,(1295,70,1515,430),'public/marca/rabisco-com-livro.webp',400)
