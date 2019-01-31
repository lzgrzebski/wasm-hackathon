#include "opencv2/objdetect.hpp"
#include "opencv2/highgui.hpp"
#include "opencv2/imgproc.hpp"
#include <cinttypes>
#include <complex>
#include <limits>
#include <cassert>
#include <memory>
#include <iostream>

extern "C" {
    bool process_video(uint8_t *src, int32_t width, int32_t height) {
        for (int32_t ydst=0; ydst < height; ++ydst) {
            for (int32_t xdst=0; xdst < width; ++xdst) {
                auto d = &src[sizeof(uint32_t) * (ydst * width + xdst)];
                double processed_color = (d[0] + d[1] + d[2]) / 3;
                d[0] = d[1] = d[2] = processed_color;
            }
        }

        return true;
    }
}