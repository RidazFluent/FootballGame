// TODO: Gerer les buts
// TODO: Corriger bugs de collisions

const CAGE_WIDTH = 30;
const CAGE_HEIGHT = 200;
const BALLON_WIDTH = 30;
const ROND_WIDTH = 900;
const MAP_HEIGHT = 500;
const COLOR_1 = ['rgb(0, 0, 255)', 'rgb(255, 255, 255)', 'rgb(255, 0, 0)'];
const COLOR_2 = ['rgb(55, 131, 56)', 'rgb(255, 255, 255)', 'rgb(255, 0, 0)'];
const CURSEUR_FORCE_WIDTH = 30;
const CURSEUR_FORCE_HEIGHT = 500;
const COLORS_PICKER = [['#2ecc71', '#3498db', '#9b59b6'],
  ['#e67e22', '#e74c3c', '#2c3e50'],
  ['#f1c40f', '#000', '#fff']];
const FLAG_HEIGHT = 60;
const FLAG_WIDTH = 90;
const COTE = { DROITE: 1, GAUCHE: 0 };
const POSITIONS = [{ x: 35, y: (MAP_HEIGHT / 2) - (BALLON_WIDTH / 2) }, // Gardien
  // Ligne de defense
  { x: 135, y: 137.5 },
  { x: 135, y: (MAP_HEIGHT - 137.5) - BALLON_WIDTH },
  // Ligne de milieu
  { x: 255, y: 40 },
  { x: 225, y: (MAP_HEIGHT / 2) - (BALLON_WIDTH / 2) },
  { x: 255, y: (MAP_HEIGHT - 40) - BALLON_WIDTH },
  // Attaquant
  { x: 335, y: (MAP_HEIGHT / 2) - (BALLON_WIDTH / 2) }];

let gf;

// Methode from W3C
// https://www.w3schools.com/js/js_cookies.asp
function getCookie(cname) {
  const name = `${cname}=`;
  const decodedCookie = decodeURIComponent(document.cookie);
  const ca = decodedCookie.split(';');

  for (let i = 0; i < ca.length; i += 1) {
    let c = ca[i];
    while (c.charAt(0) === ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) === 0) {
      return c.substring(name.length, c.length);
    }
  }
  return '';
}

// Methode from W3C
// https://www.w3schools.com/js/js_cookies.asp
function setCookie(cname, cvalue, exdays) {
  const d = new Date();
  d.setTime(d.getTime() + ((((exdays * 24) * 60) * 60) * 1000));
  const expires = `expires=${d.toUTCString()}`;
  document.cookie = `${cname}=${cvalue};${expires};path=/`;

  console.log(`cookie:${document.cookie}`);
}

class ObjetGraphique {
  constructor(pX, pY, w, h) {
    this.x = pX;
    this.y = pY;
    this.width = w;
    this.height = h;
  }

  centre() {
    return {
      x: this.x + (this.width / 2),
      y: this.y + (this.height / 2),
    };
  }

  pos() {
    return {
      x: this.x,
      y: this.y,
    };
  }

  estDans(x, y) {
    return x >= this.x && x <= this.x + this.width && y >= this.y && y <= this.y + this.height;
  }
}

class ImageObjet extends ObjetGraphique {
  constructor(x, y, src) {
    super(x, y, 32, 32);

    this.image = new Image();
    this.image.src = src;
  }

  draw(ctx) {
    ctx.save();

    ctx.translate(this.x, this.y);
    ctx.drawImage(this.image, 0, 0, this.width, this.height);

    ctx.restore();
  }
}

class ReloadButton extends ImageObjet {
  constructor(x, y) {
    super(x, y, 'img/icon.png');
  }
}

class SoundButton extends ImageObjet {
  constructor(x, y) {
    super(x, y, 'img/speaker.png');

    this.sound = 'img/speaker.png';
    this.noSound = 'img/no_speaker.png';
  }

  inverser() {
    this.image.src = (this.image.src.includes(this.sound)) ? this.noSound : this.sound;

    return this.image.src.includes(this.sound);
  }
}

class Cage extends ObjetGraphique {
  constructor(x, y) {
    super(x, y, CAGE_WIDTH, CAGE_HEIGHT);
  }

  drawSol(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.fillStyle = '#27ae60';
    ctx.fillRect(0, 0, this.width, this.height);

    ctx.restore();
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.strokeStyle = 'white';

    ctx.strokeRect(0, 0, this.width, this.height);
    ctx.lineWidth = 1;

    let space = this.width / 4;

    for (let i = 0; i < 4; i += 1) {
      ctx.strokeRect(i * space, 0, 1, this.height);
    }

    space = this.height / 11;

    for (let i = 0; i < 11; i += 1) {
      ctx.strokeRect(0, i * space, this.width, 1);
    }

    ctx.restore();
  }

  estDans(x, y) {
    return (x >= this.x) && (x <= this.x + this.width) && (y >= this.y)
      && (y <= this.y + this.height);
  }
}

class Map extends ObjetGraphique {
  constructor(x, y, w, h) {
    super(x, y, w, h);


    const yCage = (this.height / 2) - (CAGE_HEIGHT / 2);

    this.cageGauche = new Cage(this.x + -CAGE_WIDTH, this.y + yCage);
    this.cageDroite = new Cage(this.x + this.width, this.y + yCage);
  }

  draw(ctx) {
    ctx.save();

    ctx.strokeStyle = 'white';
    ctx.fillStyle = '#27ae60';
    ctx.lineWidth = 4;
    ctx.translate(this.x, this.y);

    ctx.fillRect(0, 0, this.width, this.height);


    ctx.fillStyle = '#1f8241';

    const space = this.width / 9;

    for (let i = 0; i < 9; i += 1) {
      if (i % 2 === 0) {
        const x = i * space;
        ctx.fillRect(x, 0, space, this.height);
      }
    }

    ctx.strokeRect(this.width / 2, 0, 1, this.height);

    ctx.fillStyle = 'white';

    ctx.beginPath();
    ctx.arc(this.width / 2, this.height / 2, 20 / 2, 0, 2 * Math.PI);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(this.width / 2, this.height / 2, 200 / 2, 0, 2 * Math.PI);
    ctx.stroke();

    ctx.strokeRect(0, 0, this.width, this.height);

    ctx.restore();
  }
}

class Rond extends ObjetGraphique {
  constructor(x, y, w) {
    super(x, y, w, w);

    this.vitesse = 0;
    this.angle = 0;
  }

  rayon() {
    return this.width / 2;
  }

  inverserVx() {
    this.angle = Math.PI - this.angle;
  }

  inverserVy() {
    this.angle = (2 * Math.PI) - this.angle;
  }

  update() {
    if (this.vitesse === 0) return;

    this.x += Math.cos(this.angle) * this.vitesse;
    this.y += Math.sin(this.angle) * this.vitesse;

    this.vitesse = this.vitesse - 0.1;

    if (this.vitesse < 0) this.vitesse = 0;
  }
}

class Ballon extends Rond {
  constructor(x, y) {
    super(x, y, BALLON_WIDTH, BALLON_WIDTH);
  }

  update() {
    if (this.vitesse === 0) return;

    this.x += Math.cos(this.angle) * this.vitesse;
    this.y += Math.sin(this.angle) * this.vitesse;

    this.vitesse -= 0.1;

    if (this.vitesse < 0) this.vitesse = 0;
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);

    ctx.fillStyle = 'rgb(0, 0, 0)';

    ctx.shadowColor = 'black';
    ctx.shadowBlur = 10;

    ctx.beginPath();
    ctx.arc(this.width / 2, this.height / 2, this.width / 2, 0, 2 * Math.PI, false);
    ctx.closePath();
    ctx.fill();

    ctx.shadowBlur = 0;

    ctx.beginPath();
    ctx.moveTo(11.62, 0);
    ctx.bezierCurveTo(12.86, 1.15, 14.4, 2.58, 14.4, 2.58);
    ctx.bezierCurveTo(14.4, 2.58, 17.43, 0.9, 18.83, 0.11);
    ctx.bezierCurveTo(19.15, 0.2, 19.47, 0.29, 19.78, 0.39);
    ctx.bezierCurveTo(21.14, 0.85, 22.42, 1.5, 23.57, 2.31);
    ctx.bezierCurveTo(22.5, 2.84, 21.57, 3.3, 21.57, 3.3);
    ctx.lineTo(22.43, 9.12);
    ctx.lineTo(28.22, 10.1);
    ctx.bezierCurveTo(28.22, 10.1, 28.49, 9.58, 28.86, 8.88);
    ctx.bezierCurveTo(29.6, 10.64, 30, 12.58, 30, 14.62);
    ctx.bezierCurveTo(30, 16.73, 29.56, 18.74, 28.78, 20.56);
    ctx.bezierCurveTo(28.11, 19.64, 27.55, 18.86, 27.55, 18.86);
    ctx.lineTo(21.96, 20.67);
    ctx.lineTo(21.95, 26.55);
    ctx.bezierCurveTo(21.95, 26.55, 22.58, 26.76, 23.42, 27.03);
    ctx.bezierCurveTo(22.16, 27.89, 20.76, 28.56, 19.26, 29.01);
    ctx.bezierCurveTo(17.99, 28.16, 14.91, 26.08, 14.91, 26.08);
    ctx.bezierCurveTo(14.91, 26.08, 14.34, 26.52, 13.61, 27.09);
    ctx.bezierCurveTo(12.79, 27.74, 11.75, 28.55, 11.06, 29.09);
    ctx.bezierCurveTo(9.2, 28.59, 7.49, 27.74, 5.99, 26.61);
    ctx.bezierCurveTo(6.83, 26.17, 7.48, 25.83, 7.48, 25.83);
    ctx.lineTo(6.49, 20.04);
    ctx.bezierCurveTo(6.49, 20.04, 1.22, 19.27, 0.71, 19.2);
    ctx.bezierCurveTo(0.25, 17.75, 0, 16.21, 0, 14.62);
    ctx.bezierCurveTo(0, 13.24, 0.19, 11.9, 0.54, 10.63);
    ctx.bezierCurveTo(0.69, 10.92, 0.78, 11.1, 0.78, 11.1);
    ctx.lineTo(6.57, 10.11);
    ctx.lineTo(7.43, 4.3);
    ctx.bezierCurveTo(7.43, 4.3, 6.4, 3.79, 5.25, 3.22);
    ctx.bezierCurveTo(6.85, 1.85, 8.74, 0.81, 10.81, 0.21);
    ctx.bezierCurveTo(11.07, 0.13, 11.33, 0.07, 11.6, 0.01);
    ctx.lineTo(11.62, 0);
    ctx.closePath();
    ctx.fillStyle = 'rgb(255, 255, 255)';
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(15, 10);
    ctx.lineTo(19.76, 13.45);
    ctx.lineTo(17.94, 19.05);
    ctx.lineTo(12.06, 19.05);
    ctx.lineTo(10.24, 13.45);
    ctx.closePath();
    ctx.fillStyle = 'rgb(0, 0, 0)';
    ctx.fill();

    ctx.restore();
  }
}

class Joueur extends Rond {
  constructor(x, y, c) {
    super(x, y, BALLON_WIDTH, BALLON_WIDTH);
    this.colors = c;

    this.sizeDoitJouer = {
      size: 10,
      augmente: true,
    };
  }

  draw(ctx, doitJouer) {
    if (doitJouer) {
      if (this.sizeDoitJouer.augmente) {
        this.sizeDoitJouer.size += 1;

        if (this.sizeDoitJouer.size > 40) {
          this.sizeDoitJouer.augmente = false;
        }
      } else {
        this.sizeDoitJouer.size -= 1;

        if (this.sizeDoitJouer.size < 10) {
          this.sizeDoitJouer.augmente = true;
        }
      }
    }

    ctx.save();
    ctx.translate(this.x, this.y);

    ctx.shadowColor = doitJouer ? 'white' : 'black';
    ctx.shadowBlur = doitJouer ? this.sizeDoitJouer.size : 10;
    ctx.fillStyle = 'black';

    ctx.beginPath();
    ctx.arc(this.width / 2, this.height / 2, this.width / 2, 0, 2 * Math.PI, false);
    ctx.closePath();
    ctx.fill();

    ctx.shadowBlur = 0;

    Joueur.arc(ctx, 3, 3, 24, 24, 90, -90, true);

    [ctx.fillStyle] = this.colors; // 'rgb(0, 0, 255)';
    ctx.fill();


    Joueur.arc(ctx, 3, 3, 24, 24, 270, 90, true);
    [, , ctx.fillStyle] = this.colors; // 'rgb(255, 0, 0)';
    ctx.fill();


    ctx.beginPath();
    ctx.rect(10, 2, 10, 26);
    [, ctx.fillStyle] = this.colors; // 'rgb(255, 255, 255)';
    ctx.fill();


    ctx.beginPath();
    ctx.moveTo(15, 3);
    ctx.bezierCurveTo(13.04, 3, 11.19, 3.47, 9.56, 4.3);
    ctx.bezierCurveTo(5.67, 6.28, 3, 10.33, 3, 15);
    ctx.bezierCurveTo(3, 21.63, 8.37, 27, 15, 27);
    ctx.bezierCurveTo(21.63, 27, 27, 21.63, 27, 15);
    ctx.bezierCurveTo(27, 8.37, 21.63, 3, 15, 3);
    ctx.closePath();
    ctx.moveTo(30, 15);
    ctx.bezierCurveTo(30, 23.28, 23.28, 30, 15, 30);
    ctx.bezierCurveTo(6.72, 30, 0, 23.28, 0, 15);
    ctx.bezierCurveTo(0, 9.61, 2.84, 4.88, 7.11, 2.24);
    ctx.bezierCurveTo(9.41, 0.82, 12.11, 0, 15, 0);
    ctx.bezierCurveTo(23.28, 0, 30, 6.72, 30, 15);
    ctx.closePath();
    ctx.fillStyle = 'rgb(0, 0, 0)';
    ctx.fill();

    ctx.restore();
  }

  estDans(x, y) {
    const pos = this.centre();

    const d = Math.sqrt(((pos.x - x) * (pos.x - x)) + ((pos.y - y) * (pos.y - y)));
    return d <= (this.width / 2);
  }

  calculerAngle(j) {
    const p = j.centre();
    const p2 = this.centre();

    return Math.atan((p.y - p2.y) / (p.x - p2.x));
  }

  static arc(context, x, y, w, h, startAngle, endAngle, isClosed) {
    context.save();
    context.beginPath();
    context.translate(x, y);
    context.scale(w / 2, h / 2);
    context.arc(1, 1, 1, (Math.PI / 180) * startAngle, (Math.PI / 180) * endAngle, false);

    if (isClosed) {
      context.lineTo(1, 1);
      context.closePath();
    }

    context.restore();
  }
}

class Equipe {
  constructor(cote, map) {
    this.cote = cote;
    this.joueurs = [];

    this.creerJoueurs(map);
    this.doitJouer = false;
  }

  creerJoueurs(map) {
    this.joueurs = [];

    POSITIONS.forEach((p) => {
      const x = (this.cote === COTE.GAUCHE) ? map.x + p.x
        : ((map.x + map.width) - p.x) - BALLON_WIDTH;
      const y = map.y + p.y;
      const c = (this.cote === COTE.GAUCHE) ? COLOR_1 : COLOR_2;

      this.joueurs.push(new Joueur(x, y, c));
    });
  }

  draw(ctx) {
    this.joueurs.forEach((j) => {
      j.draw(ctx, this.doitJouer);
    });
  }
}

class CurseurTir extends ObjetGraphique {
  constructor(x, y) {
    super(x, y, 100, 15);

    this.estVisible = false;
    this.angle = 0;
    this.joueur = null;
  }

  draw(ctx) {
    if (!this.estVisible) return;

    ctx.save();
    ctx.translate(this.x + (this.width / 2), this.y + (this.height / 2));
    ctx.rotate(this.angle);
    ctx.translate(-this.width / 2, -this.height / 2);

    const gradientColor = 'rgba(255, 137, 0, 1)';
    const gradientColor2 = 'rgba(255, 0, 0, 1)';

    function gradient(g) {
      g.addColorStop(0, gradientColor);
      g.addColorStop(1, gradientColor2);
      return g;
    }

    ctx.beginPath();
    ctx.moveTo(0.5, 4);
    ctx.lineTo(0.5, 11);
    ctx.lineTo(this.width - 12, 11);
    ctx.lineTo(this.width - 12, 14.5);
    ctx.lineTo(this.width, 6.76);
    ctx.lineTo(this.width - 12, -0.5);
    ctx.lineTo(this.width - 12, 4);
    ctx.lineTo(0.5, 4);
    ctx.closePath();
    ctx.fillStyle = gradient(ctx.createLinearGradient(0.5, 7, 52.5, 7));
    ctx.fill();

    ctx.restore();
  }
}

class CurseurForce extends ObjetGraphique {
  constructor(x, y) {
    super(x, y, CURSEUR_FORCE_WIDTH, CURSEUR_FORCE_HEIGHT);

    this.valeur = 0.5;
    this.margeCote = 5;
  }

  draw(ctx) {
    let margin = this.width / 2;

    ctx.save();

    ctx.translate(this.x, this.y);
    ctx.fillStyle = '#0d0e1a';
    ctx.strokeStyle = '#ecf0f1';
    ctx.lineWidth = 3;

    ctx.beginPath();
    ctx.moveTo(0, margin);
    ctx.arc(this.width / 2, margin, margin, Math.PI, 0);
    ctx.lineTo(this.width, this.height - margin);
    ctx.arc(this.width / 2, this.height - margin, margin, 0, Math.PI);
    ctx.lineTo(0, margin);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#e74c3c';

    const w = this.width - (2 * this.margeCote);
    let h = this.height - (2 * this.margeCote);

    margin = w / 2;

    h *= this.valeur;
    h -= 15;

    ctx.translate(this.margeCote, this.height - this.margeCote - margin);

    ctx.beginPath();
    ctx.arc(w / 2, 0, w / 2, 0, Math.PI);
    ctx.arc(w / 2, -h, w / 2, Math.PI, 0);
    ctx.fill();

    ctx.restore();
  }

  definirNouvelValeur(y) {
    const yMin = this.y + this.margeCote;
    const yMax = this.height - (2 * this.margeCote);

    this.valeur = 1 - ((y - yMin) / yMax);
  }
}

class ColorPicker extends ObjetGraphique {
  constructor(x, y) {
    super(x, y, 200, 200);

    this.estVisible = false;
    this.indexSelected = null;
    this.flagSelected = null;
  }

  draw(ctx) {
    if (!this.estVisible) return;

    ctx.save();

    ctx.fillStyle = '#fff';
    ctx.translate(this.x, this.y);

    const cornerRadius = 5;

    ctx.beginPath();
    ctx.arc(cornerRadius, cornerRadius, cornerRadius, Math.PI, 1.5 * Math.PI);
    ctx.arc(this.width - cornerRadius, cornerRadius, cornerRadius, 1.5 * Math.PI, 2 * Math.PI);
    ctx.arc(this.width - cornerRadius, this.height - cornerRadius, cornerRadius, 0, 0.5 * Math.PI);
    ctx.arc(cornerRadius, this.height - cornerRadius, cornerRadius, 0.5 * Math.PI, Math.PI);
    ctx.closePath();

    ctx.fill();

    ctx.translate(this.width, 10);

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(10, 10);
    ctx.lineTo(0, 20);
    ctx.fill();

    ctx.translate(-this.width, -10);

    const margeW = this.width * 0.1;
    const margeH = this.height * 0.1;

    const w = this.width - (4 * margeW);
    const h = this.height - (4 * margeH);

    ctx.translate(margeW, margeH);

    for (let i = 0; i < 3; i += 1) {
      for (let j = 0; j < 3; j += 1) {
        ctx.fillStyle = COLORS_PICKER[i][j];
        ctx.fillRect(0, 0, w / 3, h / 3);
        ctx.translate((w / 3) + margeW, 0);
      }

      ctx.translate(-3 * ((w / 3) + margeW), (h / 3) + margeH);
    }

    ctx.restore();
  }
}

class Drapeau extends ObjetGraphique {
  constructor(x, y, colors) {
    super(x, y, FLAG_WIDTH, FLAG_HEIGHT);

    this.colors = colors;
  }

  draw(ctx) {
    ctx.save();

    ctx.translate(this.x, this.y);

    for (let i = 0; i < 3; i += 1) {
      ctx.fillStyle = this.colors[i];
      ctx.fillRect(i * (this.width / 3), 0, this.width / 3, this.height);
    }

    ctx.restore();
  }

  setColor(index, color) {
    const cookie = this.colors === COLOR_1 ? 'COLOR_1_' : 'COLOR_2_';

    this.colors[index] = color;

    setCookie(cookie + index, color, 100);
  }
}

class GestionnaireCollision {
  static carreDansCarre(c1, c2) {
    return !(c2.x >= c1.x + c1.width
      || c2.x + c2.width <= c1.x
      || c2.y >= c1.y + c1.height
      || c2.y + c2.height <= c1.height);
  }

  static pointDansRectangle(c, p) {
    return p.x >= c.x
      && p.x <= c.x + c.width
      && p.y >= c.y
      && p.y <= c.y + c.height;
  }

  /**
   * Collision d'un point dans un cercle
   * @param c Cercle
   * @param r Rayon du cercle
   * @param p point
   * @returns {boolean} true s'il y a collision
   */
  static pointDansCercle(c, r, p) {
    const d = ((p.x - c.x) * (p.x - c.x)) + ((p.y - c.y) * (p.y - c.y));

    return d <= (r * r);
  }

  /**
   * Collision entre deux cercles
   * @param c1 Premier cercle
   * @param c2 Deuxieme cercle
   * @param r1 Rayon du premier cercle
   * @param r2 Rayon du deuxieme cercle
   * @returns {boolean} true s'il y a collision
   */
  static cercleCercle(c1, c2, r1, r2) {
    const d = ((c1.x - c2.x) * (c1.x - c2.x)) + ((c1.y - c2.y) * (c1.y - c2.y));

    return d <= (r1 + r2) * (r1 + r2);
  }

  /**
   * Projection d'un point sur un segment
   * @param p {int, int} Point
   * @param a {int, int} Extremité du segment
   * @param b {{int, int}} Extrémité du segment
   * @returns {boolean} true si la projection est possible
   */
  static projectionSurSegment(p, a, b) {
    const apx = p.x - a.x;
    const apy = p.y - a.y;
    const abx = b.x - a.x;
    const aby = b.y - a.y;
    const bpx = p.x - b.x;
    const bpy = p.y - b.y;
    const s1 = (apx * abx) + (apy * aby);
    const s2 = (bpx - abx) + (bpy - aby);

    return s1 * s2 <= 0;
  }

  /**
   * Indique s'il y a une collision entre un cercle et un rectangle
   * @param c {Rond} Cercle
   * @param r {ObjetGraphique} Rectangle
   * @returns {boolean} true s'il y a une collision
   */
  static cercleDansCarre(c, r) {
    if (!this.carreDansCarre(c, r)) return false;

    if (this.pointDansCercle(c, c.rayon(), { x: r.x, y: r.y })
      || this.pointDansCercle(c, c.rayon(), { x: r.x, y: r.y + r.height })
      || this.pointDansCercle(c, c.rayon(), { x: r.x + r.width, y: r.y })
      || this.pointDansCercle(c, c.rayon(), { x: r.x + r.width, y: r.y + r.height })) {

      return true;
    }

    if (this.pointDansRectangle(r, c.centre())) {
      return true;
    }

    const projVerticale = this.projectionSurSegment(c.centre(),
      { x: r.x, y: r.y }, { x: r.x, y: r.y + r.height });
    const projHorizontale = this.projectionSurSegment(c.centre(),
      { x: r.x, y: r.y }, { x: r.x + r.width, y: r.y });

    return projHorizontale || projVerticale;
  }

  static dansDrapeau(d, p) {
    const y = d.y;

    const w = d.width / 3;
    const h = d.height;

    for (let i = 0; i < 3; i += 1) {
      const x = d.x + (i * w);

      const obj = new ObjetGraphique(x, y, w, h);

      if (this.pointDansRectangle(obj, p)) {
        return {
          clicked: true,
          index: i,
          y,
          x,
          flag: d,
        };
      }
    }

    return {
      clicked: false,
    };
  }

  static dansColorPicker(c, p) {
    if (!c.estVisible) return { clicked: false };

    const margeW = c.width * 0.1;
    const margeH = c.height * 0.1;

    const w = c.width - (4 * margeW);
    const h = c.height - (4 * margeH);

    let minY = c.y;

    for (let i = 0; i < 3; i += 1) {
      minY += margeH;

      for (let j = 0; j < 3; j += 1) {
        const minX = (c.x + margeW) + (j * (margeW + (w / 3)));

        const obj = new ObjetGraphique(minX, minY, w / 3, h / 3);

        if (this.pointDansRectangle(obj, p)) {
          return {
            clicked: true,
            i,
            j,
          };
        }
      }

      minY += h / 3;
    }

    return { clicked: false };
  }

  static dansCurseurForce(c, p) {
    const x = c.x + c.margeCote;
    const y = c.y + c.margeCote;

    const w = c.width - (2 * c.margeCote);
    const h = c.height - (2 * c.margeCote);

    const obj = new ObjetGraphique(x, y, w, h);

    return this.pointDansRectangle(obj, p);
  }
}

function SoundsManager() {
  let audioBords;
  let audioJoueurs;
  let audioBut;
  let soundEnabled;

  function init() {
    audioBords = document.createElement('audio');
    audioJoueurs = document.createElement('audio');
    audioBut = document.createElement('audio');

    audioBords.src = 'sounds/collisionBords.wav';
    audioJoueurs.src = 'sounds/collisionJoueurs.wav';
    audioBut.src = 'sounds/suuu.wav';

    soundEnabled = true;
  }

  function collisionJoueurs() {
    if (!soundEnabled) return;

    audioJoueurs.pause();
    audioJoueurs.play();
  }

  function collisionBords() {
    if (!soundEnabled) return;

    audioBords.pause();
    audioBords.play();
  }

  function but() {
    if (!soundEnabled) return;

    audioBut.pause();
    audioBut.play();
  }

  function setEnabled(v) {
    soundEnabled = v;
  }

  return {
    init,
    collisionJoueurs,
    collisionBords,
    but,
    setEnabled,
  };
}

function GameFramework() {
  let canvas;
  let w;
  let h;
  let map;
  let equipes;
  let ballon;
  let ctx;
  let tour;
  let score;
  let curseurTir;
  let curseurForce;
  let colorPicker;
  let drapeauGauche;
  let drapeauDroit;
  let tirEnCours;
  let dernierTir;
  let reloadButton;
  let soundButton;
  let soundsManager;


  function initColors() {
    for (let i = 0; i < 3; i += 1) {
      COLOR_1[i] = getCookie(`COLOR_1_${i}`) === '' ? COLOR_1[i] : getCookie(`COLOR_1_${i}`);
      COLOR_2[i] = getCookie(`COLOR_2_${i}`) === '' ? COLOR_2[i] : getCookie(`COLOR_2_${i}`);
    }
  }

  function reset() {
    const x = (w / 2) - (ROND_WIDTH / 2);
    const y = (h / 2) - (MAP_HEIGHT / 2);

    tour = COTE.GAUCHE;
    equipes[0].doitJouer = true;
    equipes[1].doitJouer = false;

    equipes[0].creerJoueurs(map);
    equipes[1].creerJoueurs(map);

    ballon = new Ballon((x + (map.width / 2))
      - (BALLON_WIDTH / 2), (y + (map.height / 2)) - (BALLON_WIDTH / 2));
  }

  function fullReset() {
    reset();
    score.DROITE = 0;
    score.GAUCHE = 0;
  }

  function checkTirEnCours() {
    tirEnCours = false;
    equipes.forEach((e) => {
      e.joueurs.forEach((j) => {
        if (j.vitesse > 0) tirEnCours = true;
      });
    });
  }

  function update() {
    checkTirEnCours();

    ballon.update();

    equipes.forEach((eq) => {
      eq.joueurs.forEach((e) => {
        e.update();
      });
    });
  }

  function gererCollision(j, j2) {
    const angle = j.calculerAngle(j2);

    j.angle = angle + ((j.x > j2.x) ? 0 : Math.PI);
    j2.angle = angle + ((j2.x > j.x) ? 0 : Math.PI);

    j.angle = j.vitesse > 0 ? (2 * Math.PI) - j.angle : j.angle;
    j2.angle = j2.vitesse > 0 ? (2 * Math.PI) - j2.angle : j2.angle;


    j.vitesse = Math.max(j.vitesse, j2.vitesse);
    j2.vitesse = Math.max(j.vitesse, j2.vitesse);
  }

  function collisonBords(e) {
    // S'il y a collision avec la cage droite
    let collision = false;

    if (GestionnaireCollision.cercleDansCarre(e, map.cageDroite)) {
      if (e.x + e.width >= map.cageDroite.x + map.cageDroite.width) {
        e.x = (map.cageDroite.x + map.cageDroite.width) - e.width;
        e.inverserVx();

        collision = true;
      }
      if (e.y <= map.cageDroite.y) {
        e.y = map.cageDroite.y;
        e.inverserVy();

        collision = true;
      } else if (e.y + e.height >= map.cageDroite.y + map.cageDroite.height) {
        e.y = (map.cageDroite.y + map.cageDroite.height) - e.height;
        e.inverserVy();

        collision = true;
      }
      // S'il y a collision avec la cage gauche
    } else if (GestionnaireCollision.cercleDansCarre(e, map.cageGauche)) {
      if (e.x <= map.cageGauche.x) {
        e.x = map.cageGauche.x;
        e.inverserVx();

        collision = true;
      }
      if (e.y <= map.cageGauche.y) {
        e.y = map.cageGauche.y;
        e.inverserVy();

        collision = true;
      } else if (e.y + e.height >= map.cageGauche.y + map.cageGauche.height) {
        e.y = (map.cageGauche.y + map.cageGauche.height) - e.height;
        e.inverserVy();

        collision = true;
      }

      collision = true;
    } else if (e.x <= map.x) {
      e.x = map.x;
      e.inverserVx();

      collision = true;
    } else if (e.x + e.width >= map.x + map.width) {
      e.x = (map.x + map.width) - e.width;
      e.inverserVx();

      collision = true;
    } else if (e.y <= map.y) {
      e.y = map.y;
      e.inverserVy();

      collision = true;
    } else if (e.y + e.height >= map.y + map.height) {
      e.y = (map.y + map.height) - e.width;
      e.inverserVy();

      collision = true;
    }

    if (collision) {
      soundsManager.collisionBords();
    }
  }

  function collisions() {
    collisonBords(ballon);

    equipes.forEach((eq) => {
      eq.joueurs.forEach((e) => {
        // Touche le cote droit
        collisonBords(e);
      });
    });

    let collision = false;

    // Pour toutes les equipes
    equipes.forEach((e) => {
      // Pour chaque joueur de chaque équipe
      e.joueurs.forEach((j) => {
        if (GestionnaireCollision.cercleCercle(j, ballon, j.rayon(), ballon.rayon())) {
          gererCollision(j, ballon);
          collision = true;
        }

        // Pour chaque équipe
        equipes.forEach((e2) => {
          // Chaque joueur de chaque équipe
          e2.joueurs.forEach((j2) => {
            if (j.x === j2.x && j.y === j2.y) {
              return;
            }

            if (GestionnaireCollision.cercleCercle(j, j2, j.rayon(), j2.rayon())) {
              collision = true;
              gererCollision(j, j2);
            }
          });
        });
      });
    });

    if (collision) {
      soundsManager.collisionJoueurs();
    }

    if (GestionnaireCollision.pointDansRectangle(ballon.centre(), map.cageGauche)) {
      score.DROITE += 1;
      reset();
      soundsManager.but();
      console.log('But');
    } else if (GestionnaireCollision.pointDansRectangle(ballon.centre(), map.cageDroite)) {
      score.GAUCHE += 1;
      reset();
      soundsManager.but();
      console.log('But');
    }
  }

  function draw() {
    collisions();
    update();

    ctx.save();

    ctx.clearRect(0, 0, w, h);

    ctx.font = '70px Arial';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.fillText(`${score.GAUCHE} : ${score.DROITE}`, w / 2, (map.y / 2) + 30);

    map.draw(ctx);

    map.cageDroite.drawSol(ctx);
    map.cageGauche.drawSol(ctx);

    curseurForce.draw(ctx);
    curseurTir.draw(ctx);

    equipes[0].draw(ctx);
    equipes[1].draw(ctx);
    ballon.draw(ctx);

    drapeauGauche.draw(ctx);
    drapeauDroit.draw(ctx);

    colorPicker.draw(ctx);

    map.cageDroite.draw(ctx);
    map.cageGauche.draw(ctx);

    reloadButton.draw(ctx);
    soundButton.draw(ctx);

    ctx.restore();

    requestAnimationFrame(draw);
  }

  function tir() {
    if (tirEnCours) { return; }

    tirEnCours = true;
    dernierTir = tour;

    curseurTir.joueur.angle = curseurTir.angle;
    curseurTir.joueur.vitesse = 10.0 * parseFloat(curseurForce.valeur);
    curseurTir.estVisible = false;
    curseurTir.joueur = null;
    tour = (tour === COTE.GAUCHE) ? COTE.DROITE : COTE.GAUCHE;

    if (tour === COTE.GAUCHE) {
      equipes[0].doitJouer = true;
      equipes[1].doitJouer = false;
    } else {
      equipes[0].doitJouer = false;
      equipes[1].doitJouer = true;
    }
  }

  function init() {
    canvas = document.querySelector('#myCanvas');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    w = canvas.width;
    h = canvas.height;

    reloadButton = new ReloadButton(20, 20);
    soundButton = new SoundButton(w - 52, 20);

    soundsManager = new SoundsManager();
    soundsManager.init();

    tirEnCours = false;

    ctx = canvas.getContext('2d');

    initColors();

    const x = (w / 2) - (ROND_WIDTH / 2);
    const y = (h / 2) - (MAP_HEIGHT / 2);

    map = new Map(x, y, ROND_WIDTH, MAP_HEIGHT);

    equipes = [];
    equipes.push(new Equipe(COTE.GAUCHE, map));
    equipes.push(new Equipe(COTE.DROITE, map));

    curseurTir = new CurseurTir(10, 10);

    score = {
      GAUCHE: 0,
      DROITE: 0,
    };

    const xForce = (map.x / 2) - (CURSEUR_FORCE_WIDTH / 2);
    const yForce = (h / 2) - (CURSEUR_FORCE_HEIGHT / 2);

    curseurForce = new CurseurForce(xForce, yForce);
    colorPicker = new ColorPicker(10, 10);

    const yDrapeau = (map.y / 2) - (FLAG_HEIGHT / 2);
    const xDrapeau = (map.x + (map.width / 4)) - (FLAG_WIDTH / 2);

    drapeauGauche = new Drapeau(xDrapeau, yDrapeau, COLOR_1);
    drapeauDroit = new Drapeau(xDrapeau + (map.width / 2), yDrapeau, COLOR_2);

    reset();

    requestAnimationFrame(draw);
  }

  function clickDansJoueur(p) {
    if (tirEnCours) return null;

    const equipe = equipes[tour];

    for (let k = 0; k < equipe.joueurs.length; k += 1) {
      const j = equipe.joueurs[k];
      if (GestionnaireCollision.pointDansCercle(j.centre(), j.rayon(), p)) {
        return j;
      }
    }

    return null;
  }

  function onClick(e) {
    const p = { x: e.clientX, y: e.clientY };

    const c = GestionnaireCollision.dansColorPicker(colorPicker, p);

    if (GestionnaireCollision.pointDansRectangle(reloadButton, p)) {
      fullReset();

      return;
    }

    if (GestionnaireCollision.pointDansRectangle(soundButton, p)) {
      soundsManager.setEnabled(soundButton.inverser());

      return;
    }

    if (c.clicked) {
      console.log('couleur !');
      colorPicker.estVisible = false;
      colorPicker.flagSelected.setColor(colorPicker.indexSelected, COLORS_PICKER[c.i][c.j]);

      return;
    }

    let dClicked = GestionnaireCollision.dansDrapeau(drapeauGauche, p);

    if (!dClicked.clicked) {
      dClicked = GestionnaireCollision.dansDrapeau(drapeauDroit, p);
    }

    if (dClicked.clicked) {
      console.log('felsdkvjd');
      colorPicker.estVisible = true;
      colorPicker.y = dClicked.y;
      colorPicker.x = dClicked.x - colorPicker.width;
      colorPicker.indexSelected = dClicked.index;
      colorPicker.flagSelected = dClicked.flag;

      return;
    }

    const j = clickDansJoueur(p);
    if (j) {
      console.log('Click dans joueur');

      curseurTir.estVisible = true;
      curseurTir.joueur = j;

      const pos = j.centre();
      curseurTir.x = pos.x - (curseurTir.width / 2);
      curseurTir.y = pos.y - (curseurTir.height / 2);

      return;
    }

    if (GestionnaireCollision.dansCurseurForce(curseurForce, p)) {
      curseurForce.definirNouvelValeur(p.y);

      return;
    }

    if (curseurTir.estVisible) {
      tir();
    }
  }

  function calculerAngle(x, y) {
    const pos = curseurTir.centre();

    return Math.atan((pos.y - y) / (pos.x - x)) + ((x > pos.x) ? 0 : Math.PI);
  }

  function onMouseMove(e) {
    let dansJoueur = false;
    const p = { x: e.clientX, y: e.clientY };

    equipes.forEach((eq) => {
      eq.joueurs.forEach((j) => {
        if (GestionnaireCollision.pointDansCercle(j.centre(), j.rayon(), p)) dansJoueur = true;
      });
    });

    if (dansJoueur
      || GestionnaireCollision.pointDansRectangle(drapeauDroit, p)
      || GestionnaireCollision.pointDansRectangle(drapeauGauche, p)
      || GestionnaireCollision.dansCurseurForce(curseurForce, p)
      || GestionnaireCollision.dansColorPicker(colorPicker, p).clicked
      || GestionnaireCollision.pointDansRectangle(reloadButton, p)
      || GestionnaireCollision.pointDansRectangle(soundButton, p)) {
      document.body.style.cursor = 'pointer';
    } else {
      document.body.style.cursor = 'default';
    }

    if (curseurTir.estVisible) {
      curseurTir.angle = calculerAngle(e.clientX, e.clientY);
    }
  }

  return {
    init,
    onClick,
    onMouseMove,
  };
}

function onClickDocument(e) {
  gf.onClick(e);
}

function mouseMoveDocument(e) {
  gf.onMouseMove(e);
}

function initDocument() {
  gf = new GameFramework();
  gf.init();
}

window.onload = initDocument;
document.onclick = onClickDocument;
document.onmousemove = mouseMoveDocument;
