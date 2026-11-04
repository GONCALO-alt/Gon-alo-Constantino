'use strict';
/* Pit Box · Aparência do jogador (cosméticos) */
/* aparência do jogador (cosméticos) */
function playerColors(team){
  const su=cosmItem('suit',P.cosm.suit),gl=cosmItem('gloves',P.cosm.gloves),he=cosmItem('helmet',P.cosm.helmet),gu=cosmItem('gun',P.cosm.gun);
  return{suit:su.base??team.c1,acc:su.acc??team.c2,glove:gl.c,helmet:he.c??team.c2,mirror:!!he.mirror,gun:gu.c};
}
function applyPlayerLook(team){
  const pc=playerColors(team);const u=W.fp.userData;
  u.sleeveM.color.setHex(pc.suit);u.accM.color.setHex(0x15161a);u.gloveM.color.setHex(pc.glove);u.gunM.color.setHex(pc.gun);
  if(W.playerMech)W.playerSpot.remove(W.playerMech);
  W.playerMech=makeMechanic(Object.assign({kneel:false},pc));W.playerSpot.add(W.playerMech);
  const gunMini=new THREE.Group();gunMini.add(mesh(new THREE.CylinderGeometry(.05,.055,.25,12).rotateX(Math.PI/2),M(pc.gun,{metalness:.6,roughness:.3})));
  gunMini.position.set(.18,.62,.29);W.playerMech.add(gunMini);
}
