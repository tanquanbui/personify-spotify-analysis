// TimeRangeGenreBubbles.jsx
import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

export default function TimeRangeGenreBubbles({
  timeRange,
  setTimeRange,
  genresByRange,
  width = 920,
  height = 520
}) {
  const svgRef = useRef(null);
  const [focusRange, setFocusRange] = useState(null);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const ranges = [
      { id: "long_term", label: "Long Term" },
      { id: "medium_term", label: "Medium Term" },
      { id: "short_term", label: "Short Term" }
    ];

    const R = Math.min(width, height) * 0.25;
    const cx = [width * 0.2, width * 0.5, width * 0.8];
    const cy = height * 0.5;

    // --- root & bg
    const root = svg
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("width", "100%")
      .attr("height", "100%")
      .style("maxWidth", `${width}px`)
      .style("height", "auto")
      .style("display", "block")
      .on("click", () => {
        if (focusRange !== null) {
          setFocusRange(null);
          zoomTo(null, { altKey: false });
        }
      });

    root.append("rect")
      .attr("x", 0).attr("y", 0)
      .attr("width", width).attr("height", height)
      .attr("fill", "#eef7f0");

    const zoomG = root.append("g");

    // --- Big circles
    const big = zoomG.selectAll("g.big")
      .data(ranges)
      .join("g")
      .attr("class", "big")
      .attr("transform", (d,i) => `translate(${cx[i]},${cy})`)
      .style("cursor", "pointer")
      .on("click", (evt, d) => {
        evt.stopPropagation();
        setTimeRange(d.id);
        setFocusRange(d.id);
        zoomTo(d.id, { altKey: evt.altKey });
      });

    big.append("circle")
      .attr("r", R)
      .attr("fill", "white")
      .attr("stroke", "#334155")
      .attr("stroke-width", 2)
      .on("mouseover", function() { d3.select(this).attr("stroke-width", 3); })
      .on("mouseout",  function() { d3.select(this).attr("stroke-width", 2); });

    big.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .style("font", "16px system-ui, sans-serif")
      .text(d => d.label);

    // --- Bubbles inside each big circle
    const bubbleSize = R * 1.7; // rộng rãi chút để dễ thấy
    const packLayout = (items) =>
      d3.pack()
        .size([bubbleSize, bubbleSize])
        .padding(3)(
          d3.hierarchy({
            children: (items || []).map(g => ({
              name: g.genre,
              value: Math.max(1, Number(g.count) || 1)
            }))
          }).sum(d => d.value)
        );

    const bubbleGroups = zoomG.selectAll("g.bubbles")
      .data(ranges)
      .join("g")
      .attr("class", "bubbles")
      .attr("transform", (d,i) =>
        `translate(${cx[i] - bubbleSize/2},${cy - bubbleSize/2})`
      )
      // để chắc chắn hiển thị, không chặn sự kiện
      .style("opacity", 0);

    bubbleGroups.each(function(d) {
      // Lấy dữ liệu cho range
      let items = (genresByRange?.[d.id] || []);
      console.log(`[TimeRangeGenreBubbles] ${d.id} items:`, items);

      // Nếu không có data, dựng vài bubble placeholder để thấy được
      if (!items || items.length === 0) {
        items = [
          { genre: "No data", count: 3 },
          { genre: "Tap other range", count: 2 },
          { genre: "or fetch", count: 1 }
        ];
      }

      const root = packLayout(items);
      const g = d3.select(this);
      const nodes = root.leaves();

      g.selectAll("circle")
        .data(nodes)
        .join("circle")
        .attr("cx", n => n.x)
        .attr("cy", n => n.y)
        .attr("r",  n => n.r)
        .attr("fill", "#e8ecf7")
        .attr("stroke", "#1f2a44")
        .attr("stroke-width", 1.2);

      g.selectAll("text")
        .data(nodes)
        .join("text")
        .attr("x", n => n.x)
        .attr("y", n => n.y)
        .attr("text-anchor", "middle")
        .attr("dy", "0.35em")
        .style("font", "11px system-ui, sans-serif")
        .style("pointer-events", "none")
        .text(n => n.data.name)
        .each(function(n) {
          if (n.r < 13) d3.select(this).text("");
        });
    });

    function showBubbles(rangeId) {
      bubbleGroups
        .transition()
        .duration(400)
        .style("opacity", d => (rangeId && d.id === rangeId ? 1 : 0));
    }

    function zoomTo(targetRange, { altKey } = { altKey: false }) {
      const dur = altKey ? 7500 : 650;

      if (!targetRange) {
        showBubbles(null);
        zoomG.transition().duration(dur).attr("transform", `translate(0,0) scale(1)`);
        return;
      }
      const idx = ranges.findIndex(r => r.id === targetRange);
      const x = cx[idx];
      const y = cy;

      // scale sao cho vừa khung
      const s = Math.min(width, height) / (R * 2) * 0.95;

      showBubbles(targetRange);
      zoomG
        .transition()
        .duration(dur)
        .attr("transform", `translate(${width/2},${height/2}) scale(${s}) translate(${-x},${-y})`);
    }

    // Đồng bộ khi timeRange đổi từ nơi khác
    if (timeRange && focusRange !== timeRange) {
      setFocusRange(timeRange);
      setTimeout(() => zoomTo(timeRange, { altKey: false }), 0);
    } else {
      zoomTo(focusRange, { altKey: false });
    }
  }, [timeRange, setTimeRange, genresByRange, width, height, focusRange]);

  return <svg ref={svgRef} />;
}
