/** Previsualización de prenda: Fabric.js permite mover y escalar el diseño; para playeras usa mockups PNG locales por lado. */
import { useCallback, useEffect, useRef, useState } from 'react';
import * as fabric from 'fabric';
import tshirtFrontUrl from '../../assets/t-shirt-front.png';
import tshirtBackUrl from '../../assets/t-shirt-back.png';
import jeansFrontUrl from '../../assets/jeans-front.png';
import jeansBackUrl from '../../assets/jeans-back.png';

export type GarmentType = 'tshirt' | 'pants';
export type ContentType = 'text' | 'image';
export type GarmentSide = 'front' | 'back';

export interface Placement {
  id: string;
  label: string;
  side: GarmentSide;
  x: number;
  y: number;
}

interface GarmentPreviewProps {
  garmentType: GarmentType;
  color: string;
  contentType: ContentType | null;
  layerId?: string | null;
  layerIds?: string[];
  visible?: boolean;
  locked?: boolean;
  text: string;
  font: string;
  fontWeight?: string;
  textColor: string;
  textScale: number;
  curvature: number;
  imageUrl: string;
  imageScale: number;
  imageWidth?: number;
  imageHeight?: number;
  placement: Placement | null;
  onSelectLayer?: (id: string) => void;
  onLayerChange?: (id: string, changes: { text?: string; placement?: Placement }) => void;
  onSideChange?: (side: GarmentSide) => void;
  onSaveSide?: (side: GarmentSide, snapshot: string) => void;
}

const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 440;
const TSHIRT_PRINT_AREA = {
  left: CANVAS_WIDTH / 2,
  top: CANVAS_HEIGHT / 2 + 10,
  width: 180,
  height: 230,
  originX: 'center' as const,
  originY: 'center' as const,
};
const mockupUrls: Record<GarmentType, Record<GarmentSide, string>> = {
  tshirt: { front: tshirtFrontUrl, back: tshirtBackUrl },
  pants: { front: jeansFrontUrl, back: jeansBackUrl },
};
const tintedMockupCache = new Map<string, Promise<string>>();

/** Devuelve la zona imprimible según el mockup y la ubicación elegida. */
function getPrintArea(garmentType: GarmentType, placement: Placement | null, side: GarmentSide = 'front') {
  if (garmentType === 'tshirt') {
    const shirtAreas: Record<string, { left: number; top: number; width: number; height: number }> = {
      'tee-front-center': { left: 200, top: 246, width: 180, height: 150 },
      'tee-front-upper-center': { left: 200, top: 153, width: 150, height: 66 },
      'tee-front-upper-left': { left: 157, top: 153, width: 90, height: 66 },
      'tee-front-upper-right': { left: 243, top: 153, width: 90, height: 66 },
      'tee-front-lower-left': { left: 157, top: 317, width: 90, height: 62 },
      'tee-front-lower-right': { left: 243, top: 317, width: 90, height: 62 },
      'tee-back-center': { left: 200, top: 246, width: 180, height: 150 },
      'tee-back-upper-center': { left: 200, top: 153, width: 150, height: 66 },
      'tee-back-upper-left': { left: 157, top: 153, width: 90, height: 66 },
      'tee-back-upper-right': { left: 243, top: 153, width: 90, height: 66 },
      'tee-back-lower-left': { left: 157, top: 317, width: 90, height: 62 },
      'tee-back-lower-right': { left: 243, top: 317, width: 90, height: 62 },
      'tee-middle-middle': { left: 200, top: 220, width: 170, height: 120 },
    };
    const area = placement ? shirtAreas[placement.id] : undefined;
    return area ? { ...area, originX: 'center' as const, originY: 'center' as const } : TSHIRT_PRINT_AREA;
  }

  const pantsAreas: Record<string, { left: number; top: number; width: number; height: number }> = {
    'pants-front-waist': { left: 200, top: 32, width: 90, height: 36 },
    'pants-front-left-pocket': { left: 160, top: 60, width: 58, height: 48 },
    'pants-front-right-pocket': { left: 240, top: 60, width: 58, height: 48 },
    'pants-front-left-thigh': { left: 160, top: 190, width: 58, height: 142 },
    'pants-front-right-thigh': { left: 240, top: 190, width: 58, height: 142 },
    'pants-front-left-calf': { left: 160, top: 326, width: 54, height: 100 },
    'pants-front-right-calf': { left: 240, top: 326, width: 54, height: 100 },
    'pants-back-left-pocket': { left: 160, top: 100, width: 58, height: 66 },
    'pants-back-right-pocket': { left: 240, top: 100, width: 58, height: 66 },
    'pants-back-left-leg': { left: 160, top: 190, width: 58, height: 210 },
    'pants-back-right-leg': { left: 240, top: 190, width: 58, height: 210 },
    'pants-back-left-leg-upper': { left: 160, top: 135, width: 58, height: 105 },
    'pants-back-left-leg-lower': { left: 160, top: 270, width: 58, height: 105 },
    'pants-back-right-leg-upper': { left: 240, top: 135, width: 58, height: 105 },
    'pants-back-right-leg-lower': { left: 240, top: 270, width: 58, height: 105 },
  };
  const area = placement ? pantsAreas[placement.id] : undefined;
  return area ? { ...area, originX: 'center' as const, originY: 'center' as const } : {
    left: side === 'front' ? 160 : 240,
    top: side === 'front' ? 190 : 130,
    width: 58,
    height: 142,
    originX: 'center' as const,
    originY: 'center' as const,
  };
}

function getDefaultPoint(garmentType: GarmentType, side: GarmentSide) {
  if (garmentType === 'pants') return { left: side === 'front' ? 160 : 240, top: side === 'front' ? 190 : 130 };
  return { left: CANVAS_WIDTH / 2, top: CANVAS_HEIGHT / 2 };
}

/** Tiñe los píxeles opacos del PNG por multiplicación para conservar sombras y costuras. */
function tintMockup(source: string, color: string): Promise<string> {
  const cacheKey = `${source}:${color}`;
  const cached = tintedMockupCache.get(cacheKey);
  if (cached) return cached;

  const tinted = new Promise<string>((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const context = canvas.getContext('2d', { willReadFrequently: true });
      if (!context) {
        reject(new Error('No se pudo preparar el color de la prenda.'));
        return;
      }

      context.drawImage(image, 0, 0);
      const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
      const tint = [1, 3, 5].map((index) => Number.parseInt(color.slice(index, index + 2), 16));
      for (let index = 0; index < pixels.data.length; index += 4) {
        const shade = (pixels.data[index] * 0.299 + pixels.data[index + 1] * 0.587 + pixels.data[index + 2] * 0.114) / 255;
        pixels.data[index] = tint[0] * shade;
        pixels.data[index + 1] = tint[1] * shade;
        pixels.data[index + 2] = tint[2] * shade;
      }
      context.putImageData(pixels, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    image.onerror = () => reject(new Error('No se pudo cargar el mockup de la playera.'));
    image.src = source;
  });
  tintedMockupCache.set(cacheKey, tinted);
  return tinted;
}

function createPrintClip(garmentType: GarmentType, placement: Placement | null, side: GarmentSide) {
  return new fabric.Rect({ ...getPrintArea(garmentType, placement, side), absolutePositioned: true });
}

export default function GarmentPreview({
  garmentType,
  color,
  contentType,
  layerId = null,
  layerIds = [],
  visible = true,
  locked = false,
  text,
  font,
  fontWeight = '700',
  textColor,
  textScale,
  curvature,
  imageUrl,
  imageScale,
  imageWidth = 100,
  imageHeight = 100,
  placement,
  onSelectLayer,
  onLayerChange,
  onSideChange,
  onSaveSide,
}: GarmentPreviewProps) {
  const canvasElementRef = useRef<HTMLCanvasElement | null>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const printGuideRef = useRef<fabric.Rect | null>(null);
  const designObjectsRef = useRef<Record<GarmentSide, fabric.FabricObject[]>>({ front: [], back: [] });
  const [side, setSide] = useState<GarmentSide>(placement?.side ?? 'front');
  const [canvasError, setCanvasError] = useState('');
  const [savedSides, setSavedSides] = useState<Record<GarmentSide, boolean>>({ front: false, back: false });
  const savedSnapshotsRef = useRef<Record<GarmentSide, string | null>>({ front: null, back: null });
  const activeSideRef = useRef(side);
  const sidePlacementsRef = useRef<Record<GarmentSide, Placement | null>>({ front: null, back: null });
  const textObjectRef = useRef<fabric.IText | null>(null);
  const textObjectsRef = useRef<Record<string, fabric.IText>>({});
  const imageObjectRef = useRef<fabric.FabricImage | null>(null);
  const textPlacementIdsRef = useRef<Record<GarmentSide, string>>({ front: '', back: '' });
  const imagePlacementIdsRef = useRef<Record<GarmentSide, string>>({ front: '', back: '' });
  const textSignaturesRef = useRef<Record<GarmentSide, string>>({ front: '', back: '' });
  const imageSignaturesRef = useRef<Record<GarmentSide, string>>({ front: '', back: '' });
  const textDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    activeSideRef.current = side;
    if (placement) sidePlacementsRef.current[placement.side] = placement;
  }, [placement, side]);

  const saveCurrentSide = () => {
    const objects = designObjectsRef.current[side];
    const snapshot = JSON.stringify(objects.map((object) => object.toObject()));
    savedSnapshotsRef.current[side] = snapshot;
    onSaveSide?.(side, snapshot);
    setSavedSides((current) => ({ ...current, [side]: true }));
  };

  const setCanvasSide = useCallback((nextSide: GarmentSide) => {
    const canvas = fabricCanvasRef.current;
    const currentSide = activeSideRef.current;
    if (!canvas || nextSide === currentSide) return;

    const currentObjects = canvas.getObjects().filter((object) => object !== printGuideRef.current);
    designObjectsRef.current[currentSide] = currentObjects;
    const selectedLayerObject = layerId ? textObjectsRef.current[layerId] : null;
    if (selectedLayerObject && currentObjects.includes(selectedLayerObject)) {
      designObjectsRef.current[currentSide] = designObjectsRef.current[currentSide].filter((object) => object !== selectedLayerObject);
      designObjectsRef.current[nextSide] = [...designObjectsRef.current[nextSide].filter((object) => object !== selectedLayerObject), selectedLayerObject];
    }
    currentObjects.forEach((object) => canvas.remove(object));

    textObjectRef.current = null;
    imageObjectRef.current = null;
    designObjectsRef.current[nextSide].forEach((object) => canvas.add(object));
    textObjectRef.current = [...designObjectsRef.current[nextSide]].reverse().find((object): object is fabric.IText => object instanceof fabric.IText) ?? null;
    imageObjectRef.current = [...designObjectsRef.current[nextSide]].reverse().find((object): object is fabric.FabricImage => object instanceof fabric.FabricImage) ?? null;
    setSide(nextSide);
    onSideChange?.(nextSide);
    canvas.requestRenderAll();
  }, [layerId, onSideChange]);

  useEffect(() => {
    if (contentType !== null) return;
    textObjectRef.current = null;
    imageObjectRef.current = null;
  }, [contentType]);

  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    const keep = new Set(layerIds);
    Object.entries(textObjectsRef.current).forEach(([id, object]) => {
      if (!keep.has(id)) {
        canvas.remove(object);
        delete textObjectsRef.current[id];
        designObjectsRef.current.front = designObjectsRef.current.front.filter((item) => item !== object);
        designObjectsRef.current.back = designObjectsRef.current.back.filter((item) => item !== object);
      }
    });
    canvas.requestRenderAll();
  }, [layerIds]);

  useEffect(() => {
    if (!placement) return;
    setCanvasSide(placement.side);
  }, [placement, setCanvasSide]);

  useEffect(() => {
    if (!canvasElementRef.current) return;

    const canvas = new fabric.Canvas(canvasElementRef.current, {
      width: CANVAS_WIDTH,
      height: CANVAS_HEIGHT,
      backgroundColor: 'transparent',
      preserveObjectStacking: true,
      selection: true,
    });
    fabricCanvasRef.current = canvas;
    const printGuide = new fabric.Rect({
      ...getPrintArea(garmentType, null),
      fill: 'rgba(8, 145, 178, 0.025)',
      stroke: 'rgba(8, 145, 178, 0.38)',
      strokeDashArray: [6, 5],
      strokeWidth: 1,
      selectable: false,
      evented: false,
    });
    printGuideRef.current = printGuide;
    canvas.add(printGuide);

    canvas.on('mouse:wheel', (opt) => {
      const delta = opt.e.deltaY;
      let zoom = canvas.getZoom();
      zoom *= 0.999 ** delta;
      if (zoom > 5) zoom = 5;
      if (zoom < 0.5) zoom = 0.5;
      canvas.zoomToPoint(new fabric.Point(opt.e.offsetX, opt.e.offsetY), zoom);
      opt.e.preventDefault();
      opt.e.stopPropagation();
    });

    let isDragging = false;
    let lastPosX = 0;
    let lastPosY = 0;

    canvas.on('mouse:down', (opt) => {
      const evt = opt.e;
      if (!opt.target) {
        isDragging = true;
        const clientX = 'clientX' in evt ? evt.clientX : (evt as TouchEvent).touches[0]?.clientX || 0;
        const clientY = 'clientY' in evt ? evt.clientY : (evt as TouchEvent).touches[0]?.clientY || 0;
        lastPosX = clientX;
        lastPosY = clientY;
      }
    });

    canvas.on('mouse:move', (opt) => {
      if (isDragging) {
        const e = opt.e;
        const clientX = 'clientX' in e ? e.clientX : (e as TouchEvent).touches[0]?.clientX || 0;
        const clientY = 'clientY' in e ? e.clientY : (e as TouchEvent).touches[0]?.clientY || 0;
        const vpt = canvas.viewportTransform;
        if (vpt) {
          vpt[4] += clientX - lastPosX;
          vpt[5] += clientY - lastPosY;
          canvas.requestRenderAll();
          lastPosX = clientX;
          lastPosY = clientY;
        }
      }
    });

    canvas.on('mouse:up', () => {
      isDragging = false;
    });

    const constrainObject = (object: fabric.FabricObject) => {
      const currentSide = activeSideRef.current;
      const currentPlacement = sidePlacementsRef.current[currentSide];
      const area = getPrintArea(garmentType, currentPlacement, currentSide);
      const currentWidth = object.getScaledWidth();
      const currentHeight = object.getScaledHeight();
      const minLeft = area.left - area.width / 2 + Math.min(currentWidth, area.width) / 2;
      const maxLeft = area.left + area.width / 2 - Math.min(currentWidth, area.width) / 2;
      const minTop = area.top - area.height / 2 + Math.min(currentHeight, area.height) / 2;
      const maxTop = area.top + area.height / 2 - Math.min(currentHeight, area.height) / 2;
      object.set({
        left: Math.min(maxLeft, Math.max(minLeft, object.left ?? area.left)),
        top: Math.min(maxTop, Math.max(minTop, object.top ?? area.top)),
      });
      object.setCoords();
    };

    canvas.on('object:moving', ({ target }) => {
      if (target) constrainObject(target);
    });

    canvas.on('object:scaling', ({ target }) => {
      if (!target) return;
      const currentSide = activeSideRef.current;
      const currentPlacement = sidePlacementsRef.current[currentSide];
      const area = getPrintArea(garmentType, currentPlacement, currentSide);
      const maxScaleX = area.width / (target.width || 1);
      const maxScaleY = area.height / (target.height || 1);
      const maxScale = Math.min(maxScaleX, maxScaleY);
      if (Math.max(target.scaleX ?? 1, target.scaleY ?? 1) > maxScale) target.scale(Math.max(0.05, maxScale));
      constrainObject(target);
    });

    canvas.on('object:modified', () => {
      const active = canvas.getActiveObject();
      const id = (active as fabric.IText & { layerId?: string } | null)?.layerId;
      if (active && id) {
        const x = Math.round(((active.left ?? CANVAS_WIDTH / 2) / CANVAS_WIDTH) * 300);
        const y = Math.round(((active.top ?? CANVAS_HEIGHT / 2) / CANVAS_HEIGHT) * 340);
        onLayerChange?.(id, { placement: { id: `custom-${activeSideRef.current}-${id}`, label: 'Personalizada', side: activeSideRef.current, x, y } });
      }
      savedSnapshotsRef.current[activeSideRef.current] = null;
      setSavedSides((current) => ({ ...current, [activeSideRef.current]: false }));
    });

    canvas.on('text:changed', () => {
      const active = canvas.getActiveObject() as (fabric.IText & { layerId?: string }) | undefined;
      if (active?.layerId) {
        const id = active.layerId;
        const value = active.text ?? '';
        if (textDebounceRef.current) clearTimeout(textDebounceRef.current);
        textDebounceRef.current = setTimeout(() => onLayerChange?.(id, { text: value }), 350);
      }
      savedSnapshotsRef.current[activeSideRef.current] = null;
      setSavedSides((current) => ({ ...current, [activeSideRef.current]: false }));
    });

    return () => {
      if (textDebounceRef.current) clearTimeout(textDebounceRef.current);
      fabricCanvasRef.current = null;
      printGuideRef.current = null;
      textObjectRef.current = null;
      imageObjectRef.current = null;
      try {
        canvas.dispose();
      } catch (e) {
        console.error('Error al disponer el canvas:', e);
      }
    };
  }, [garmentType, onLayerChange]);

  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    const select = (event: { selected?: fabric.FabricObject[] }) => {
      const object = event.selected?.[0] as (fabric.FabricObject & { layerId?: string }) | undefined;
      if (object?.layerId) onSelectLayer?.(object.layerId);
    };
    canvas.on('selection:created', select);
    canvas.on('selection:updated', select);
    return () => {
      canvas.off('selection:created', select);
      canvas.off('selection:updated', select);
    };
  }, [onSelectLayer]);

  useEffect(() => {
    const guide = printGuideRef.current;
    if (!guide) return;
    guide.set(getPrintArea(garmentType, sidePlacementsRef.current[side], side));
    guide.setCoords();
    fabricCanvasRef.current?.requestRenderAll();
  }, [garmentType, placement, side]);

  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    let cancelled = false;

    tintMockup(mockupUrls[garmentType][side], color)
      .then((dataUrl) => fabric.FabricImage.fromURL(dataUrl))
      .then((mockup) => {
        if (cancelled || fabricCanvasRef.current !== canvas) return;
        const imgWidth = mockup.width || 1;
        const imgHeight = mockup.height || 1;
        const scale = Math.min((CANVAS_WIDTH * 0.9) / imgWidth, (CANVAS_HEIGHT * 0.9) / imgHeight);
        mockup.set({
          originX: 'center',
          originY: 'center',
          left: CANVAS_WIDTH / 2,
          top: CANVAS_HEIGHT / 2,
          scaleX: scale,
          scaleY: scale,
          selectable: false,
          evented: false,
        });
        canvas.backgroundImage = mockup;
        canvas.requestRenderAll();
        setCanvasError('');
      })
      .catch(() => {
        if (!cancelled) setCanvasError('No se pudo cargar la imagen de la prenda. Intenta cambiar el color.');
      });

    return () => { cancelled = true; };
  }, [color, garmentType, side]);

  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || contentType !== 'text' || !text.trim()) return;
    const activePlacement = placement?.side === side ? placement : null;
    const signature = `${text}|${font}|${fontWeight}|${textColor}|${textScale}|${curvature}|${activePlacement?.id ?? 'default'}`;
    if (textSignaturesRef.current[side] && textSignaturesRef.current[side] !== signature) {
      savedSnapshotsRef.current[side] = null;
      setSavedSides((current) => current[side] ? { ...current, [side]: false } : current);
    }
    textSignaturesRef.current[side] = signature;

    if (!layerId) return;
    let textObject = textObjectsRef.current[layerId] ?? null;
    const fallbackPoint = getDefaultPoint(garmentType, side);
    const nextPlacementId = activePlacement?.id ?? 'default';
    if (!textObject) {
      const left = activePlacement ? (activePlacement.x / 300) * CANVAS_WIDTH : fallbackPoint.left;
      const top = activePlacement ? (activePlacement.y / 340) * CANVAS_HEIGHT : fallbackPoint.top;
      textObject = new fabric.IText(text.slice(0, 24), {
        left,
        top,
        originX: 'center',
        originY: 'center',
        fontSize: 24,
        fontFamily: font,
        fill: textColor,
        clipPath: createPrintClip(garmentType, activePlacement, side),
        cornerColor: '#0891b2',
        borderColor: '#0891b2',
        transparentCorners: false,
      });
      (textObject as fabric.IText & { layerId?: string }).layerId = layerId;
      textObjectRef.current = textObject;
      textObjectsRef.current[layerId] = textObject;
      textPlacementIdsRef.current[side] = nextPlacementId;
      designObjectsRef.current[side] = [...designObjectsRef.current[side].filter((object) => object !== textObject), textObject];
      designObjectsRef.current[side === 'front' ? 'back' : 'front'] = designObjectsRef.current[side === 'front' ? 'back' : 'front'].filter((object) => object !== textObject);
      canvas.add(textObject);
    }

    if (textPlacementIdsRef.current[side] !== nextPlacementId) {
      textObject.set({
        left: activePlacement ? (activePlacement.x / 300) * CANVAS_WIDTH : fallbackPoint.left,
        top: activePlacement ? (activePlacement.y / 340) * CANVAS_HEIGHT : fallbackPoint.top,
      });
      textPlacementIdsRef.current[side] = nextPlacementId;
    }

    textObject.set({
      text: text.slice(0, 24),
      fontFamily: font,
      fontWeight,
      fill: textColor,
      opacity: visible ? 1 : 0,
      selectable: !locked,
      evented: !locked && visible,
      hasControls: !locked,
      editable: !locked,
      fontSize: 24 * textScale,
      clipPath: createPrintClip(garmentType, activePlacement, side),
      path: curvature ? new fabric.Path(`M 0 ${Math.abs(curvature)} Q 90 ${curvature > 0 ? 0 : Math.abs(curvature) * 2} 180 ${Math.abs(curvature)}`, { fill: 'rgba(0,0,0,0)', stroke: 'rgba(0,0,0,0)', strokeWidth: 0 }) : undefined,
    });
    const maxTextWidth = getPrintArea(garmentType, activePlacement, side).width * 0.88;
    if (textObject.width > maxTextWidth) {
      textObject.set('fontSize', (textObject.fontSize * maxTextWidth) / textObject.width);
    }
    textObject.setCoords();
    if (canvas.getActiveObject() !== textObject && !locked) canvas.setActiveObject(textObject);
    if (locked && canvas.getActiveObject() === textObject) canvas.discardActiveObject();
    canvas.requestRenderAll();
  }, [contentType, curvature, font, fontWeight, garmentType, layerId, placement, side, text, textColor, textScale, visible, locked]);

  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || contentType !== 'image' || !imageUrl) return;
    const activePlacement = sidePlacementsRef.current[side];
    const signature = `${imageUrl}|${imageScale}|${activePlacement?.id ?? 'default'}`;
    if (imageSignaturesRef.current[side] && imageSignaturesRef.current[side] !== signature) {
      savedSnapshotsRef.current[side] = null;
      setSavedSides((current) => current[side] ? { ...current, [side]: false } : current);
    }
    imageSignaturesRef.current[side] = signature;
    let cancelled = false;
    let imageObject = imageObjectRef.current;

    const updateImage = (object: fabric.FabricImage, positionOnPlacement: boolean) => {
      const activePlacement = sidePlacementsRef.current[side];
      const fallbackPoint = getDefaultPoint(garmentType, side);
      const left = activePlacement ? (activePlacement.x / 300) * CANVAS_WIDTH : fallbackPoint.left;
      const top = activePlacement ? (activePlacement.y / 340) * CANVAS_HEIGHT : fallbackPoint.top;
      const nextPlacementId = activePlacement?.id ?? 'default';
      const shouldMoveToPlacement = positionOnPlacement || imagePlacementIdsRef.current[side] !== nextPlacementId;
      const area = getPrintArea(garmentType, activePlacement, side);
      const requestedScaleX = (imageWidth / object.width!) * imageScale;
      const requestedScaleY = (imageHeight / object.height!) * imageScale;
      const maxFitScaleX = (area.width * 0.88) / object.width!;
      const maxFitScaleY = (area.height * 0.88) / object.height!;
      object.set({
        ...(shouldMoveToPlacement ? { left, top, originX: 'center' as const, originY: 'center' as const } : {}),
        scaleX: Math.min(requestedScaleX, maxFitScaleX),
        scaleY: Math.min(requestedScaleY, maxFitScaleY),
        clipPath: createPrintClip(garmentType, activePlacement, side),
        cornerColor: '#0891b2',
        borderColor: '#0891b2',
        transparentCorners: false,
      });
      if (shouldMoveToPlacement) imagePlacementIdsRef.current[side] = nextPlacementId;
      object.setCoords();
      if (!canvas.getObjects().includes(object)) canvas.add(object);
      canvas.setActiveObject(object);
      canvas.requestRenderAll();
    };

    if (imageObject) {
      updateImage(imageObject, false);
    } else {
      fabric.FabricImage.fromURL(imageUrl)
        .then((loadedImage) => {
          if (cancelled || fabricCanvasRef.current !== canvas) return;
          imageObject = loadedImage;
          imageObjectRef.current = loadedImage;
          designObjectsRef.current[side] = [...designObjectsRef.current[side].filter((object) => object !== textObjectRef.current), loadedImage];
          updateImage(loadedImage, true);
        })
        .catch(() => {
          if (!cancelled) setCanvasError('No se pudo mostrar la imagen cargada. Prueba con PNG, JPG o WEBP.');
        });
    }

    return () => { cancelled = true; };
  }, [contentType, garmentType, imageHeight, imageScale, imageUrl, imageWidth, placement, side]);

  return (
    <div className="mx-auto flex w-full flex-col items-center justify-center gap-6 lg:flex-row lg:items-start lg:justify-between">
      {/* Canvas totalmente libre y centrado sin textos molestos */}
      <div className="flex flex-1 items-center justify-center p-4">
        <div className="relative overflow-hidden">
          <canvas 
            ref={canvasElementRef} 
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className="block cursor-grab active:cursor-grabbing"
            aria-label={`Editor interactivo de ${garmentType === 'pants' ? 'pantalón' : 'playera'}, vista ${side === 'front' ? 'frontal' : 'trasera'}`} 
          />
        </div>
      </div>

      {/* Panel lateral derecho fijado hacia el extremo derecho de la pantalla */}
      <div className="flex w-full max-w-[16rem] flex-shrink-0 flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div>
          <span className="font-body text-[9px] uppercase tracking-[0.2em] text-slate-400">Cambiar vista</span>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {(['front', 'back'] as const).map((option) => (
              <button 
                key={option} 
                type="button" 
                aria-pressed={side === option} 
                onClick={() => setCanvasSide(option)} 
                className={`cursor-pointer border px-3 py-2 font-body text-[9px] uppercase tracking-[0.16em] transition-colors ${
                  side === option 
                    ? 'border-primary bg-primary/5 text-primary font-semibold' 
                    : 'border-slate-200 text-slate-500 hover:border-slate-400'
                }`}
              >
                {option === 'front' ? 'Frente' : 'Espalda'}
              </button>
            ))}
          </div>
        </div>

        <hr className="border-slate-100" />

        <div className="flex flex-col gap-2">
          <span className="font-body text-[9px] uppercase tracking-[0.2em] text-slate-400">Acciones</span>
          <button 
            type="button" 
            onClick={saveCurrentSide} 
            className="flex w-full cursor-pointer items-center justify-center gap-2 border border-primary/40 bg-primary/5 px-4 py-2.5 font-body text-[9px] uppercase tracking-[0.16em] text-primary transition-colors hover:bg-primary/10"
          >
            {savedSides[side] ? `Actualizar · ${side === 'front' ? 'Frente' : 'Espalda'}` : `Guardar ${side === 'front' ? 'frente' : 'espalda'}`}
          </button>
          
          <div className="rounded-lg bg-slate-50 p-2.5 text-center">
            <p className="font-body text-[9px] text-slate-500">
              <span className="font-semibold">Frente:</span> {savedSides.front ? 'Guardado ✓' : 'Pendiente'}
            </p>
            <p className="font-body text-[9px] text-slate-500 mt-1">
              <span className="font-semibold">Espalda:</span> {savedSides.back ? 'Guardado ✓' : 'Pendiente'}
            </p>
          </div>
        </div>

        {placement && (
          <>
            <hr className="border-slate-100" />
            <div>
              <span className="font-body text-[9px] uppercase tracking-[0.2em] text-slate-400">Ubicación activa</span>
              <p className="mt-1 font-body text-[10px] text-slate-600">{placement.label}</p>
            </div>
          </>
        )}

        {canvasError && <p role="alert" className="text-center font-body text-[10px] text-red-600">{canvasError}</p>}
      </div>
    </div>
  );
}
